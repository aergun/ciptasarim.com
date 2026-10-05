# syntax=docker/dockerfile:1
#
# Multi-stage build for ciptasarim.com.
#
# Why a Dockerfile and not the Nixpacks build pack
# ------------------------------------------------
# Nixpacks generates its build plan from the app config and silently ignores a
# repo-level build config file, so the toolchain has to be installable some
# other way, and here we own the whole sequence.
#
# The actual failure this works around
# ------------------------------------
# better-sqlite3@13 ships platform prebuilds inside its npm tarball
# (prebuilds/linux-x64.node) but declares NO `install` script, so npm's implicit
# gypfile fallback compiles it from source regardless of the prebuild:
#
#   // @npmcli/arborist/lib/arborist/rebuild.js
#   const isGyp = gypfile !== false && !install && !preinstall
#     && await isNodeGypPackage(node.path)
#   if (isGyp) scripts.install = defaultGypInstallScript   // "node-gyp rebuild"
#
# node-gyp needs Python plus a C++ toolchain. Both stages below use the same
# Debian bookworm base, so the binary compiled in `build` is ABI- and
# libc-compatible with the `runtime` image that executes it.
#
# ⚠️ Accepting the ~1–2 minute compile on every deploy in exchange for this. On
# the 2 vCPU production box that is the dominant cost of a deploy.
#
# Note on secrets: nothing secret is passed as a build ARG. SESSION_SECRET and
# the other runtime values come from the container environment set in Coolify.

# ---------------------------------------------------------------- build stage
FROM node:22-bookworm-slim AS build

# python3  — node-gyp generates its makefiles with it
# build-essential — C++ toolchain (g++, make) for the SQLite amalgamation
# Ordering: toolchain before source copy, so editing app code does not
# invalidate the expensive layer and trigger a recompile.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies in their own layer, cached on package.json/package-lock.json.
# --include=dev is explicit: the build phase needs tsc and vite, and npm skips
# devDependencies whenever a production flag is present in the build env.
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY tsconfig.json tsconfig.server.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src ./src
COPY server ./server
COPY shared ./shared
COPY content ./content
COPY locales ./locales
COPY public ./public

RUN npm run build

# -------------------------------------------------------------- runtime stage
FROM node:22-bookworm-slim AS runtime

# Runs as the image's default (root) user: the app writes to /app/data and
# /app/server/files, which are volume mounts, and Coolify manages the container
# lifecycle. A non-root user would need matching ownership on those host paths,
# which Coolify does not configure for us.
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8000 \
    DATABASE_PATH=/app/data/app.db \
    FILES_DIR=/app/server/files

# server/, shared/, content/ and locales/ are all required at runtime — the
# Express server imports catalogue, pricing and label data from them directly,
# and it is run through tsx from source, not from a compiled bundle. Omitting
# `locales` here is the easy mistake: the server resolves `T` prose fields per
# request, so a missing bundle is a runtime 500 on every catalogue page rather
# than a build error.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY server ./server
COPY shared ./shared
COPY content ./content
COPY locales ./locales
COPY public ./public

# Created here so the runtime directories exist on a fresh container before any
# volume is attached. A missing `files` mount means licence downloads 410
# rather than crashing — which is why FILES_DIR is pinned above and the
# directory belongs in the Coolify panel as a persistent storage.
RUN mkdir -p /app/data /app/server/files

EXPOSE 8000

# tsx is a runtime dependency, not a dev one — `npm start` is
# `tsx server/index.ts --prod`, so pruning devDependencies would leave the
# container without a working entrypoint.
CMD ["npm", "start"]