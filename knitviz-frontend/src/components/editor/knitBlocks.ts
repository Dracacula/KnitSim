import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

/**
 * Custom Knitting Block Definitions
 * 
 * Example:
 * {
 *   type: 'custom_block_1',
 *   message0: 'My custom pattern %1 stitches for %2 rows',
 *   args0: [
 *     { type: 'field_number', name: 'STITCHES', value: 20 },
 *     { type: 'field_number', name: 'ROWS', value: 4 },
 *   ],
 *   previousStatement: null,
 *   nextStatement: null,
 *   colour: 150,
 *   tooltip: 'My custom knitting pattern',
 * }
 */

export interface BlockDefinition {
    type: string;
    [key: string]: any;
}

export interface ToolBoxContent {
    kind: string;
    name?: string;
    contents?: (ToolBoxContent | { kind: string; type: string; text?: string })[];
}

export const customBlockDefinitions: BlockDefinition[] = [
    {
        type: 'custom_block_1',
        message0: 'Custom pattern %1 x %2',
        args0: [
            { type: 'field_number', name: 'STITCHES', value: 20 },
            { type: 'field_number', name: 'ROWS', value: 4 },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 150,
        tooltip: 'Your custom pattern description',
    },
];

/**
 * Register custom block generators
 * 
 * Example:
 * javascriptGenerator.forBlock['custom_block_1'] = function(block) {
 *   const stitches = block.getFieldValue('STITCHES');
 *   const rows = block.getFieldValue('ROWS');
 *   return `for (let r = 0; r < ${rows}; r++) { state.knit(${stitches}, 'KNIT'); state.end_row(); }\n`;
 * };
 */
export function registerCustomGenerators() {
    javascriptGenerator.forBlock['custom_block_1'] = function (block) {
        const stitches = block.getFieldValue('STITCHES');
        const rows = block.getFieldValue('ROWS');
        return `for (let r = 0; r < ${rows}; r++) { state.knit(${stitches}, 'KNIT'); state.end_row(); }\n`;
    };
}

export const patternPresets = {
    stripedPattern: {
        kind: 'block',
        type: 'knit_row',
        inputs: {
            DO: {
                block: {
                    type: 'knit_knit_color',
                    fields: {
                        STITCHES: 24,
                        COLOR: '#ffff00'
                    }
                }
            }
        },
        next: {
            block: {
                type: 'knit_repeat',
                fields: {
                    TIMES: 10
                },
                inputs: {
                    DO: {
                        block: {
                                    type: 'knit_row',
                                    inputs: {
                                        DO: {
                                            block: {
                                                type: 'knit_knit_color',
                                                fields: {
                                                    STITCHES: 6,
                                                    COLOR: '#0000ff'
                                                },
                                                next: {
                                                    block: {
                                                        type: 'knit_purl_color',
                                                        fields: {
                                                            STITCHES: 4,
                                                            COLOR: '#ff0000'
                                                        },
                                                        next: {
                                                            block: {
                                                                type: 'knit_knit_color',
                                                                fields: {
                                                                    STITCHES: 4,
                                                                    COLOR: '#0000ff'
                                                                },
                                                                next: {
                                                                    block: {
                                                                        type: 'knit_purl_color',
                                                                        fields: {
                                                                            STITCHES: 4,
                                                                            COLOR: '#ff0000'
                                                                        },
                                                                        next: {
                                                                            block: {
                                                                                type: 'knit_knit_color',
                                                                                fields: {
                                                                                    STITCHES: 6,
                                                                                    COLOR: '#0000ff'
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                }
                    }
                },
                next: {
                    block: {
                        type: 'knit_row',
                        inputs: {
                            DO: {
                                block: {
                                    type: 'knit_knit_color',
                                    fields: {
                                        STITCHES: 24,
                                        COLOR: '#ffff00'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export function registerCustomBlocks(): ToolBoxContent[] {
    const definitions = Blockly.common.createBlockDefinitionsFromJsonArray(customBlockDefinitions);
    Blockly.common.defineBlocks(definitions);
    registerCustomGenerators();

    return [
        {
            kind: 'category',
            name: 'Custom Blocks',
            contents: customBlockDefinitions.map(def => ({
                kind: 'block',
                type: def.type,
            })),
        },
        {
            kind: 'category',
            name: 'Presets',
            contents: [
                patternPresets.stripedPattern
            ]
        }
    ] as ToolBoxContent[];
}
