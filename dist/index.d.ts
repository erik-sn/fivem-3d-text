interface DefaultConfig {
    /** array of 3 integers representing [red, green, blue] color
     * that the text will show in */
    rgb?: number[];
    /** whether or not the text should have an outline */
    textOutline?: boolean;
    /** Direct scaling multiplier */
    scaleMultiplier?: number;
    /** integer representing the font type */
    font?: number;
    /** Scaling factor based on perspective */
    perspectiveScale?: number;
    /** distance from the coordinates in which a player
    must be within to make the 3D text visible  */
    radius?: number;
    /** if using draw3DTextTimeout this represents the time
    in milliseconds after which the 3D text will no longer
    be visible */
    timeout?: number;
}
export interface Config extends DefaultConfig {
    /** x coordinate to spawn the 3D text at */
    x: number;
    /** y coordinate to spawn the 3D text at */
    y: number;
    /** z coordinate to spawn the 3D text at */
    z: number;
    /** text string to display */
    text: string;
}
/**
 * Draw text based on the input configuration for one frame
 * @param config - configuration object
 */
export declare function draw3DText(config: Config): void;
/**
 * Draw text based on the input configuration. Will permanently exist
 * and will be visible as long as the player is in range.
 * @param config - Configuration object
 */
export declare function draw3DTextPermanent(config?: Config): void;
/**
 * Draw text based on the input configuration. After the specified
 * timeout the text will disappear until the player walks out of and
 * back into range.
 * @param config - Configuration object
 */
export declare function draw3DTextTimeout(config?: Config): void;
declare const _default: {
    draw3DText: typeof draw3DText;
    draw3DTextPermanent: typeof draw3DTextPermanent;
    draw3DTextTimeout: typeof draw3DTextTimeout;
};
export default _default;
