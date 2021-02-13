[fivem-3d-text](README.md) / Exports

# fivem-3d-text

## Table of contents

### Interfaces

- [Config](interfaces/config.md)

### Properties

- [default](modules.md#default)

### Functions

- [draw3DText](modules.md#draw3dtext)
- [draw3DTextPermanent](modules.md#draw3dtextpermanent)
- [draw3DTextTimeout](modules.md#draw3dtexttimeout)

## Properties

### default

• **default**: { `draw3DText`: (`config`: [*Config*](interfaces/config.md)) => *void* ; `draw3DTextPermanent`: (`config?`: [*Config*](interfaces/config.md)) => *void* ; `draw3DTextTimeout`: (`config?`: [*Config*](interfaces/config.md)) => *void*  }

#### Type declaration:

Name | Type |
------ | ------ |
`draw3DText` | (`config`: [*Config*](interfaces/config.md)) => *void* |
`draw3DTextPermanent` | (`config?`: [*Config*](interfaces/config.md)) => *void* |
`draw3DTextTimeout` | (`config?`: [*Config*](interfaces/config.md)) => *void* |

## Functions

### draw3DText

▸ **draw3DText**(`config`: [*Config*](interfaces/config.md)): *void*

Draw text based on the input configuration for one frame

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`config` | [*Config*](interfaces/config.md) | configuration object    |

**Returns:** *void*

Defined in: index.ts:166

___

### draw3DTextPermanent

▸ **draw3DTextPermanent**(`config?`: [*Config*](interfaces/config.md)): *void*

Draw text based on the input configuration. Will permanently exist
and will be visible as long as the player is in range.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`config?` | [*Config*](interfaces/config.md) | Configuration object    |

**Returns:** *void*

Defined in: index.ts:195

___

### draw3DTextTimeout

▸ **draw3DTextTimeout**(`config?`: [*Config*](interfaces/config.md)): *void*

Draw text based on the input configuration. After the specified
timeout the text will disappear until the player walks out of and
back into range.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`config?` | [*Config*](interfaces/config.md) | Configuration object    |

**Returns:** *void*

Defined in: index.ts:205
