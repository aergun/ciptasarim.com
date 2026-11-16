/**
 * GOAL v2 cell data for the announcement panel (see `src/components/GoalV2Panel.tsx`).
 * The numbers are the announcement's own, not catalogue measurements — the panel
 * renders them exactly as published, badges and all.
 *
 * `halves` holds the half-cell rectangles the overlay tints: `b` is the
 * fractional bounding box in the layout plate, `m` marks the mirrored half,
 * `c` the shared half-cell id so mirror pairs draw their dashed axis.
 */

export type GoalHalf = { m: boolean; c: string; b: [number, number, number, number] }
export type GoalCell = {
  name: string
  group: string
  w: number
  h: number
  area: number
  ms: number
  dev: number
  lvsdev: number
  nets: number
  drc: [number, number, number, number]
  lvs: string[]
  matched: boolean
  hier: boolean
  sym: string
  px: [number, number]
  halves: GoalHalf[]
}

export const GOAL_CELLS: readonly GoalCell[] = [
 {
  "name": "ota_5t",
  "group": "Amplifiers",
  "w": 28.75,
  "h": 23.25,
  "area": 668.3,
  "ms": 28.8,
  "dev": 6,
  "lvsdev": 9,
  "nets": 8,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   2612
  ],
  "halves": [
   {
    "m": false,
    "c": "ota_5t_half",
    "b": [
     0.46426,
     0.02955,
     0.86397,
     0.97287
    ]
   },
   {
    "m": true,
    "c": "ota_5t_half",
    "b": [
     0.08462,
     0.02955,
     0.48433,
     0.97287
    ]
   }
  ]
 },
 {
  "name": "ota_5t_xsymm",
  "group": "Amplifiers",
  "w": 38.98,
  "h": 15.23,
  "area": 593.5,
  "ms": 10.6,
  "dev": 6,
  "lvsdev": 9,
  "nets": 8,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "x",
  "px": [
   3200,
   1325
  ],
  "halves": [
   {
    "m": false,
    "c": "ota_5t_half",
    "b": [
     0.08524,
     0.07051,
     0.8694,
     0.50122
    ]
   },
   {
    "m": true,
    "c": "ota_5t_half",
    "b": [
     0.08524,
     0.49229,
     0.8694,
     0.923
    ]
   }
  ]
 },
 {
  "name": "folded_cascode",
  "group": "Amplifiers",
  "w": 44.75,
  "h": 29.05,
  "area": 1299.8,
  "ms": 43.3,
  "dev": 11,
  "lvsdev": 18,
  "nets": 15,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   2120
  ],
  "halves": [
   {
    "m": false,
    "c": "folded_cascode_half",
    "b": [
     0.47704,
     0.04342,
     0.90565,
     0.95434
    ]
   },
   {
    "m": true,
    "c": "folded_cascode_half",
    "b": [
     0.06133,
     0.04342,
     0.48993,
     0.95434
    ]
   }
  ]
 },
 {
  "name": "telescopic",
  "group": "Amplifiers",
  "w": 28.75,
  "h": 32.3,
  "area": 928.6,
  "ms": 224.1,
  "dev": 9,
  "lvsdev": 16,
  "nets": 14,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   3579
  ],
  "halves": [
   {
    "m": false,
    "c": "telescopic_half",
    "b": [
     0.46443,
     0.032,
     0.86224,
     0.97821
    ]
   },
   {
    "m": true,
    "c": "telescopic_half",
    "b": [
     0.08659,
     0.032,
     0.4844,
     0.97821
    ]
   }
  ]
 },
 {
  "name": "fd_two_stage",
  "group": "Amplifiers",
  "w": 107.75,
  "h": 70.3,
  "area": 7574.1,
  "ms": 308.0,
  "dev": 36,
  "lvsdev": 41,
  "nets": 21,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   2130
  ],
  "halves": [
   {
    "m": false,
    "c": "fd_two_stage_half",
    "b": [
     0.50028,
     0.60633,
     0.96913,
     0.96475
    ]
   },
   {
    "m": true,
    "c": "fd_two_stage_half",
    "b": [
     0.03678,
     0.60633,
     0.50563,
     0.96475
    ]
   }
  ]
 },
 {
  "name": "fd_folded_cascode",
  "group": "Amplifiers",
  "w": 51.89,
  "h": 104.78,
  "area": 5436.7,
  "ms": 195.7,
  "dev": 33,
  "lvsdev": 39,
  "nets": 20,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   6218
  ],
  "halves": [
   {
    "m": false,
    "c": "fd_folded_cascode_half",
    "b": [
     0.483,
     0.0725,
     0.90783,
     0.97641
    ]
   },
   {
    "m": true,
    "c": "fd_folded_cascode_half",
    "b": [
     0.07225,
     0.0725,
     0.49708,
     0.97641
    ]
   }
  ]
 },
 {
  "name": "rail_to_rail_input",
  "group": "Amplifiers",
  "w": 48.38,
  "h": 74.79,
  "area": 3618.4,
  "ms": 160.4,
  "dev": 18,
  "lvsdev": 26,
  "nets": 18,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   4845
  ],
  "halves": [
   {
    "m": false,
    "c": "rail_to_rail_input_half",
    "b": [
     0.47993,
     0.20757,
     0.88977,
     0.97355
    ]
   },
   {
    "m": true,
    "c": "rail_to_rail_input_half",
    "b": [
     0.08119,
     0.20757,
     0.49103,
     0.97355
    ]
   }
  ]
 },
 {
  "name": "class_ab_output",
  "group": "Amplifiers",
  "w": 33.72,
  "h": 12.9,
  "area": 434.9,
  "ms": 27.9,
  "dev": 12,
  "lvsdev": 18,
  "nets": 13,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1300
  ],
  "halves": [
   {
    "m": false,
    "c": "class_ab_output_half",
    "b": [
     0.4759,
     0.07853,
     0.88795,
     0.91662
    ]
   },
   {
    "m": true,
    "c": "class_ab_output_half",
    "b": [
     0.06813,
     0.07853,
     0.48018,
     0.91662
    ]
   }
  ]
 },
 {
  "name": "fvf_buffer",
  "group": "Amplifiers",
  "w": 12.72,
  "h": 13.21,
  "area": 168.0,
  "ms": 10.9,
  "dev": 3,
  "lvsdev": 5,
  "nets": 6,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   3319
  ],
  "halves": [
   {
    "m": false,
    "c": "fvf_buffer_half",
    "b": [
     0.43546,
     0.05044,
     0.73437,
     0.94338
    ]
   },
   {
    "m": true,
    "c": "fvf_buffer_half",
    "b": [
     0.14939,
     0.05044,
     0.4483,
     0.94338
    ]
   }
  ]
 },
 {
  "name": "gilbert_mixer",
  "group": "Amplifiers",
  "w": 22.04,
  "h": 21.74,
  "area": 479.1,
  "ms": 67.6,
  "dev": 9,
  "lvsdev": 15,
  "nets": 12,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   3158
  ],
  "halves": [
   {
    "m": false,
    "c": "gilbert_mixer_half",
    "b": [
     0.45247,
     0.31699,
     0.83572,
     0.95952
    ]
   },
   {
    "m": true,
    "c": "gilbert_mixer_half",
    "b": [
     0.09409,
     0.31699,
     0.47734,
     0.95952
    ]
   }
  ]
 },
 {
  "name": "adc_comparator",
  "group": "Comparators",
  "w": 50.11,
  "h": 102.25,
  "area": 5124.1,
  "ms": 536.6,
  "dev": 406,
  "lvsdev": 185,
  "nets": 61,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": true,
  "sym": "y",
  "px": [
   3200,
   6278
  ],
  "halves": [
   {
    "m": false,
    "c": "XL_slcore__slcore_half",
    "b": [
     0.47961,
     0.14025,
     0.66889,
     0.53275
    ]
   },
   {
    "m": true,
    "c": "XL_slcore__slcore_half",
    "b": [
     0.30139,
     0.14025,
     0.49067,
     0.53275
    ]
   },
   {
    "m": false,
    "c": "XA_boxa__boxa_half",
    "b": [
     0.47988,
     0.0237,
     0.65237,
     0.15135
    ]
   },
   {
    "m": true,
    "c": "XA_boxa__boxa_half",
    "b": [
     0.31791,
     0.0237,
     0.4904,
     0.15135
    ]
   },
   {
    "m": false,
    "c": "XB.0_boxb.0__boxb_0_half",
    "b": [
     0.48376,
     0.52655,
     0.9053,
     0.65979
    ]
   },
   {
    "m": true,
    "c": "XB.0_boxb.0__boxb_0_half",
    "b": [
     0.06498,
     0.52655,
     0.48652,
     0.65979
    ]
   },
   {
    "m": false,
    "c": "XB.1_boxb.1__boxb_1_half",
    "b": [
     0.48376,
     0.65152,
     0.9053,
     0.78194
    ]
   },
   {
    "m": true,
    "c": "XB.1_boxb.1__boxb_1_half",
    "b": [
     0.06498,
     0.65152,
     0.48652,
     0.78194
    ]
   },
   {
    "m": false,
    "c": "XB.2_boxb.2__boxb_2_half",
    "b": [
     0.48357,
     0.77611,
     0.59767,
     0.82322
    ]
   },
   {
    "m": true,
    "c": "XB.2_boxb.2__boxb_2_half",
    "b": [
     0.3726,
     0.77611,
     0.48671,
     0.82322
    ]
   },
   {
    "m": false,
    "c": "XB.3_boxb.3__boxb_3_half",
    "b": [
     0.4833,
     0.81495,
     0.78077,
     0.93531
    ]
   },
   {
    "m": true,
    "c": "XB.3_boxb.3__boxb_3_half",
    "b": [
     0.1895,
     0.81495,
     0.48698,
     0.93531
    ]
   },
   {
    "m": false,
    "c": "XB.4_boxb.4__boxb_4_half",
    "b": [
     0.48357,
     0.92948,
     0.69407,
     0.97942
    ]
   },
   {
    "m": true,
    "c": "XB.4_boxb.4__boxb_4_half",
    "b": [
     0.27621,
     0.92948,
     0.48671,
     0.97942
    ]
   },
   {
    "m": false,
    "c": "slcomp__half",
    "b": [
     0.06821,
     0.02487,
     0.48348,
     0.97659
    ]
   },
   {
    "m": true,
    "c": "slcomp__half",
    "b": [
     0.4868,
     0.02487,
     0.90207,
     0.97659
    ]
   }
  ]
 },
 {
  "name": "strongarm_comparator",
  "group": "Comparators",
  "w": 36.35,
  "h": 18.12,
  "area": 658.6,
  "ms": 235.4,
  "dev": 30,
  "lvsdev": 39,
  "nets": 20,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1657
  ],
  "halves": [
   {
    "m": false,
    "c": "strongarm_comparator_s1_half",
    "b": [
     0.28361,
     0.04457,
     0.48967,
     0.93214
    ]
   },
   {
    "m": true,
    "c": "strongarm_comparator_s1_half",
    "b": [
     0.09263,
     0.04457,
     0.29869,
     0.93214
    ]
   },
   {
    "m": false,
    "c": "strongarm_comparator_s2_half",
    "b": [
     0.58582,
     0.04457,
     0.69784,
     0.93367
    ]
   },
   {
    "m": true,
    "c": "strongarm_comparator_s2_half",
    "b": [
     0.48967,
     0.04457,
     0.60169,
     0.93367
    ]
   },
   {
    "m": false,
    "c": "strongarm_comparator_s3_half",
    "b": [
     0.74731,
     0.04457,
     0.81185,
     0.93367
    ]
   },
   {
    "m": true,
    "c": "strongarm_comparator_s3_half",
    "b": [
     0.69784,
     0.04457,
     0.76239,
     0.93367
    ]
   },
   {
    "m": false,
    "c": "strongarm_comparator_s4_half",
    "b": [
     0.83843,
     0.04457,
     0.88009,
     0.93852
    ]
   },
   {
    "m": true,
    "c": "strongarm_comparator_s4_half",
    "b": [
     0.81185,
     0.04457,
     0.85351,
     0.93852
    ]
   }
  ]
 },
 {
  "name": "double_tail_comparator",
  "group": "Comparators",
  "w": 17.46,
  "h": 23.22,
  "area": 405.3,
  "ms": 119.8,
  "dev": 12,
  "lvsdev": 17,
  "nets": 12,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   4203
  ],
  "halves": [
   {
    "m": false,
    "c": "double_tail_comparator_half",
    "b": [
     0.4427,
     0.03763,
     0.78481,
     0.96108
    ]
   },
   {
    "m": true,
    "c": "double_tail_comparator_half",
    "b": [
     0.13159,
     0.03763,
     0.4737,
     0.96108
    ]
   }
  ]
 },
 {
  "name": "sense_amp_latch",
  "group": "Comparators",
  "w": 18.22,
  "h": 24.15,
  "area": 440.0,
  "ms": 115.7,
  "dev": 10,
  "lvsdev": 18,
  "nets": 10,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   4190
  ],
  "halves": [
   {
    "m": false,
    "c": "sense_amp_latch_half",
    "b": [
     0.44509,
     0.03691,
     0.79276,
     0.97739
    ]
   },
   {
    "m": true,
    "c": "sense_amp_latch_half",
    "b": [
     0.12713,
     0.03691,
     0.4748,
     0.97739
    ]
   }
  ]
 },
 {
  "name": "ct_comparator_hyst",
  "group": "Comparators",
  "w": 27.12,
  "h": 30.44,
  "area": 825.6,
  "ms": 60.4,
  "dev": 13,
  "lvsdev": 17,
  "nets": 11,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   3574
  ],
  "halves": [
   {
    "m": false,
    "c": "ct_comparator_hyst_half",
    "b": [
     0.46057,
     0.02379,
     0.84339,
     0.96456
    ]
   },
   {
    "m": true,
    "c": "ct_comparator_hyst_half",
    "b": [
     0.09892,
     0.02379,
     0.48174,
     0.96456
    ]
   }
  ]
 },
 {
  "name": "schmitt_trigger",
  "group": "Comparators",
  "w": 10.47,
  "h": 6.21,
  "area": 65.0,
  "ms": 10.7,
  "dev": 6,
  "lvsdev": 8,
  "nets": 6,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1947
  ],
  "halves": [
   {
    "m": false,
    "c": "schmitt_trigger_half",
    "b": [
     0.41823,
     0.05334,
     0.69738,
     0.89097
    ]
   },
   {
    "m": true,
    "c": "schmitt_trigger_half",
    "b": [
     0.15468,
     0.05334,
     0.43384,
     0.89097
    ]
   }
  ]
 },
 {
  "name": "bandgap_reference",
  "group": "References, bias & power",
  "w": 102.7,
  "h": 55.45,
  "area": 5694.7,
  "ms": 304.9,
  "dev": 57,
  "lvsdev": 56,
  "nets": 29,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1785
  ],
  "halves": [
   {
    "m": false,
    "c": "bandgap_reference_half",
    "b": [
     0.34146,
     0.19255,
     0.64829,
     0.95679
    ]
   },
   {
    "m": true,
    "c": "bandgap_reference_half",
    "b": [
     0.04203,
     0.19255,
     0.34886,
     0.95679
    ]
   }
  ]
 },
 {
  "name": "subthreshold_reference",
  "group": "References, bias & power",
  "w": 36.27,
  "h": 17.92,
  "area": 649.8,
  "ms": 73.9,
  "dev": 6,
  "lvsdev": 12,
  "nets": 6,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1643
  ],
  "halves": [
   {
    "m": false,
    "c": "subthreshold_reference_half",
    "b": [
     0.47699,
     0.04489,
     0.881,
     0.93606
    ]
   },
   {
    "m": true,
    "c": "subthreshold_reference_half",
    "b": [
     0.07748,
     0.04489,
     0.4815,
     0.93606
    ]
   }
  ]
 },
 {
  "name": "bias_generator",
  "group": "References, bias & power",
  "w": 64.39,
  "h": 78.77,
  "area": 5072.6,
  "ms": 172.4,
  "dev": 41,
  "lvsdev": 55,
  "nets": 31,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   3881
  ],
  "halves": [
   {
    "m": false,
    "c": "bias_generator_half",
    "b": [
     0.48465,
     0.22973,
     0.91596,
     0.97393
    ]
   },
   {
    "m": true,
    "c": "bias_generator_half",
    "b": [
     0.05586,
     0.22973,
     0.48717,
     0.97393
    ]
   }
  ]
 },
 {
  "name": "cascode_mirror_bank",
  "group": "References, bias & power",
  "w": 55.08,
  "h": 13.4,
  "area": 738.2,
  "ms": 27.9,
  "dev": 12,
  "lvsdev": 19,
  "nets": 13,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   872
  ],
  "halves": [
   {
    "m": false,
    "c": "cascode_mirror_bank_half",
    "b": [
     0.48507,
     0.09916,
     0.92395,
     0.89642
    ]
   },
   {
    "m": true,
    "c": "cascode_mirror_bank_half",
    "b": [
     0.04917,
     0.09916,
     0.48804,
     0.89642
    ]
   }
  ]
 },
 {
  "name": "lvt_cascode_mirror",
  "group": "References, bias & power",
  "w": 47.95,
  "h": 11.29,
  "area": 541.3,
  "ms": 27.0,
  "dev": 8,
  "lvsdev": 14,
  "nets": 8,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   847
  ],
  "halves": [
   {
    "m": false,
    "c": "lvt_cascode_mirror_half",
    "b": [
     0.47941,
     0.10625,
     0.89844,
     0.88852
    ]
   },
   {
    "m": true,
    "c": "lvt_cascode_mirror_half",
    "b": [
     0.0634,
     0.10625,
     0.48242,
     0.88852
    ]
   }
  ]
 },
 {
  "name": "current_steering_cell",
  "group": "References, bias & power",
  "w": 24.03,
  "h": 12.25,
  "area": 294.3,
  "ms": 119.1,
  "dev": 12,
  "lvsdev": 21,
  "nets": 15,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1691
  ],
  "halves": [
   {
    "m": false,
    "c": "current_steering_cell_half",
    "b": [
     0.45779,
     0.07,
     0.85047,
     0.92477
    ]
   },
   {
    "m": true,
    "c": "current_steering_cell_half",
    "b": [
     0.08791,
     0.07,
     0.4806,
     0.92477
    ]
   }
  ]
 },
 {
  "name": "ldo_10ma",
  "group": "References, bias & power",
  "w": 166.01,
  "h": 59.64,
  "area": 9900.7,
  "ms": 232.5,
  "dev": 22,
  "lvsdev": 27,
  "nets": 13,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1228
  ],
  "halves": [
   {
    "m": false,
    "c": "ldo_10ma_s1_half",
    "b": [
     0.17702,
     0.64823,
     0.31682,
     0.94802
    ]
   },
   {
    "m": true,
    "c": "ldo_10ma_s1_half",
    "b": [
     0.04053,
     0.64823,
     0.18032,
     0.94802
    ]
   },
   {
    "m": false,
    "c": "ldo_10ma_s2_half",
    "b": [
     0.6403,
     0.535,
     0.96036,
     0.94802
    ]
   },
   {
    "m": true,
    "c": "ldo_10ma_s2_half",
    "b": [
     0.32354,
     0.535,
     0.6436,
     0.94802
    ]
   }
  ]
 },
 {
  "name": "power_switch_driver",
  "group": "References, bias & power",
  "w": 56.89,
  "h": 22.53,
  "area": 1281.7,
  "ms": 40.7,
  "dev": 7,
  "lvsdev": 10,
  "nets": 7,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1342
  ],
  "halves": [
   {
    "m": false,
    "c": "power_switch_driver_half",
    "b": [
     0.48593,
     0.06319,
     0.91434,
     0.93339
    ]
   },
   {
    "m": true,
    "c": "power_switch_driver_half",
    "b": [
     0.06039,
     0.06319,
     0.4888,
     0.93339
    ]
   }
  ]
 },
 {
  "name": "charge_pump",
  "group": "References, bias & power",
  "w": 24.26,
  "h": 62.71,
  "area": 1521.0,
  "ms": 758.1,
  "dev": 29,
  "lvsdev": 36,
  "nets": 20,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   7798
  ],
  "halves": [
   {
    "m": false,
    "c": "charge_pump_half",
    "b": [
     0.45825,
     0.1856,
     0.81003,
     0.97348
    ]
   },
   {
    "m": true,
    "c": "charge_pump_half",
    "b": [
     0.12888,
     0.1856,
     0.48066,
     0.97348
    ]
   }
  ]
 },
 {
  "name": "ring_vco",
  "group": "Oscillators, timing & data conversion",
  "w": 49.71,
  "h": 27.81,
  "area": 1382.5,
  "ms": 1533.7,
  "dev": 47,
  "lvsdev": 57,
  "nets": 26,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1845
  ],
  "halves": [
   {
    "m": false,
    "c": "ring_vco_half",
    "b": [
     0.47933,
     0.04779,
     0.91322,
     0.96372
    ]
   },
   {
    "m": true,
    "c": "ring_vco_half",
    "b": [
     0.05705,
     0.04779,
     0.49094,
     0.96372
    ]
   }
  ]
 },
 {
  "name": "starved_vco",
  "group": "Oscillators, timing & data conversion",
  "w": 20.5,
  "h": 13.65,
  "area": 279.7,
  "ms": 76.1,
  "dev": 24,
  "lvsdev": 36,
  "nets": 20,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   2172
  ],
  "halves": [
   {
    "m": false,
    "c": "starved_vco_half",
    "b": [
     0.45593,
     0.0384,
     0.82016,
     0.9361
    ]
   },
   {
    "m": true,
    "c": "starved_vco_half",
    "b": [
     0.09968,
     0.0384,
     0.46391,
     0.9361
    ]
   }
  ]
 },
 {
  "name": "maneatis_delay_cell",
  "group": "Oscillators, timing & data conversion",
  "w": 12.55,
  "h": 15.46,
  "area": 194.1,
  "ms": 60.0,
  "dev": 7,
  "lvsdev": 10,
  "nets": 9,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": true,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   3908
  ],
  "halves": [
   {
    "m": false,
    "c": "maneatis_delay_cell_half",
    "b": [
     0.42254,
     0.04684,
     0.73692,
     0.97548
    ]
   },
   {
    "m": true,
    "c": "maneatis_delay_cell_half",
    "b": [
     0.15373,
     0.04684,
     0.46811,
     0.97548
    ]
   }
  ]
 },
 {
  "name": "ring_osc_hier",
  "group": "Oscillators, timing & data conversion",
  "w": 12.94,
  "h": 6.11,
  "area": 79.0,
  "ms": 77.4,
  "dev": 14,
  "lvsdev": 15,
  "nets": 10,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1575
  ],
  "halves": [
   {
    "m": false,
    "c": "ring_osc_hier_half",
    "b": [
     0.41787,
     0.06081,
     0.75146,
     0.88349
    ]
   },
   {
    "m": true,
    "c": "ring_osc_hier_half",
    "b": [
     0.12885,
     0.06081,
     0.46244,
     0.88349
    ]
   }
  ]
 },
 {
  "name": "delay_line_8",
  "group": "Oscillators, timing & data conversion",
  "w": 24.6,
  "h": 14.33,
  "area": 352.4,
  "ms": 199.6,
  "dev": 34,
  "lvsdev": 52,
  "nets": 29,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1915
  ],
  "halves": [
   {
    "m": false,
    "c": "delay_line_8_half",
    "b": [
     0.44921,
     0.04154,
     0.8469,
     0.93436
    ]
   },
   {
    "m": true,
    "c": "delay_line_8_half",
    "b": [
     0.0863,
     0.04154,
     0.48399,
     0.93436
    ]
   }
  ]
 },
 {
  "name": "nonoverlap_clockgen",
  "group": "Oscillators, timing & data conversion",
  "w": 19.22,
  "h": 8.68,
  "area": 166.9,
  "ms": 27.8,
  "dev": 22,
  "lvsdev": 23,
  "nets": 14,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1513
  ],
  "halves": [
   {
    "m": false,
    "c": "nonoverlap_clockgen_half",
    "b": [
     0.45596,
     0.0559,
     0.82634,
     0.90009
    ]
   },
   {
    "m": true,
    "c": "nonoverlap_clockgen_half",
    "b": [
     0.09308,
     0.0559,
     0.46346,
     0.90009
    ]
   }
  ]
 },
 {
  "name": "tspc_divider",
  "group": "Oscillators, timing & data conversion",
  "w": 31.69,
  "h": 7.92,
  "area": 251.1,
  "ms": 155.9,
  "dev": 48,
  "lvsdev": 50,
  "nets": 31,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   892
  ],
  "halves": [
   {
    "m": false,
    "c": "tspc_divider_half",
    "b": [
     0.47329,
     0.08464,
     0.88703,
     0.87521
    ]
   },
   {
    "m": true,
    "c": "tspc_divider_half",
    "b": [
     0.0641,
     0.08464,
     0.47784,
     0.87521
    ]
   }
  ]
 },
 {
  "name": "tg_dff_reset",
  "group": "Oscillators, timing & data conversion",
  "w": 18.06,
  "h": 6.59,
  "area": 119.1,
  "ms": 137.4,
  "dev": 24,
  "lvsdev": 26,
  "nets": 15,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1246
  ],
  "halves": [
   {
    "m": false,
    "c": "tg_dff_reset_half",
    "b": [
     0.45314,
     0.06905,
     0.81636,
     0.87409
    ]
   },
   {
    "m": true,
    "c": "tg_dff_reset_half",
    "b": [
     0.0979,
     0.06905,
     0.46112,
     0.87409
    ]
   }
  ]
 },
 {
  "name": "analog_mux_4to1",
  "group": "Oscillators, timing & data conversion",
  "w": 17.72,
  "h": 10.18,
  "area": 180.3,
  "ms": 125.0,
  "dev": 16,
  "lvsdev": 18,
  "nets": 15,
  "drc": [
   0,
   0,
   0,
   0
  ],
  "lvs": [
   "match",
   "match"
  ],
  "matched": false,
  "hier": false,
  "sym": "y",
  "px": [
   3200,
   1890
  ],
  "halves": [
   {
    "m": false,
    "c": "analog_mux_4to1_half",
    "b": [
     0.45223,
     0.07334,
     0.8133,
     0.92032
    ]
   },
   {
    "m": true,
    "c": "analog_mux_4to1_half",
    "b": [
     0.09929,
     0.07334,
     0.46037,
     0.92032
    ]
   }
  ]
 }
]
