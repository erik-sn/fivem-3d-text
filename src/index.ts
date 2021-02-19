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

// constants related to the retry backoffs
// see plot with these constants here: https://docs.google.com/spreadsheets/d/1t_7QG1YB0XhuyBDTrLYqZNL4z7LfUN0HZoCKPKf-WSY/edit#gid=2147061935
const SCALING_CONSTANT = 0.063;
const EXPONENTIAL_CONSTANT = 1.4;
const DISTANCE_SAFETY_FACTOR = 1.25;
const DISTANCE_CEILING = 25000;
const MIN_BACKOFF_TIME = 500;
const MAX_BACKOFF_TIME = 30000;

const DEFAULT_CONFIG: DefaultConfig = {
  rgb: [255, 255, 255],
  textOutline: true,
  scaleMultiplier: 1,
  font: 0,
  perspectiveScale: 4,
  radius: 15,
  timeout: 5000,
};

const delay = async (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Get the distance from the player's position to the input coordinates
 * @param x - x coordinate
 * @param y - y coordinate
 * @param z - z coordinate
 */
function getDistanceToTarget(x: number, y: number, z: number): number {
  const [playerX, playerY, playerZ] = GetEntityCoords(PlayerPedId(), false);
  return Vdist2(playerX, playerY, playerZ, x, y, z);
}

/**
 * Get the next retry interval based on current paramters
 * @param radius - radius set for this 3D text
 * @param distance - current distance from the target
 */
function getRetryIntervalTime(radius: number, distance: number): number {
  if (distance > DISTANCE_CEILING) return MAX_BACKOFF_TIME; // we're very far away now
  if (distance < radius * DISTANCE_SAFETY_FACTOR) return MIN_BACKOFF_TIME; // we're relatively close
  
  // new retry interval as a function of distance.
  const newInterval = MIN_BACKOFF_TIME + ((distance * SCALING_CONSTANT) ** EXPONENTIAL_CONSTANT);
  return newInterval;
}

/**
 * Base control loop for determining if the 3D text should be visible
 * and managing the interval for how often to re-check if it should be
 * visible or not.
 * @param config - configuration object
 * @param useTimeout - whether or not we should be using the timeout
 * functionality
 */
function draw3DTextLoop(config?: Config, useTimeout = false): void {
  const _config = { ...DEFAULT_CONFIG, ...config };
  const { x, y, z, radius } = _config;

  let interval = MIN_BACKOFF_TIME;
  let distanceToTarget = 0;

  let withinRange = false;
  let timeoutFinished = false;

  // loop to check if we are in range and render the text
  const loopTick = setTick(
    async (): Promise<void> => {
      if (useTimeout && timeoutFinished) {
        clearTick(loopTick);
        return;
      };
  
      distanceToTarget = getDistanceToTarget(x, y, z);
      withinRange = distanceToTarget <= radius;
  
      if (withinRange) {
        interval = MIN_BACKOFF_TIME;
        draw3DText(_config);
        if (useTimeout) {
          setTimeout(() => {
            timeoutFinished = true;
          }, _config.timeout);
        }
      } else {
        interval = getRetryIntervalTime(radius, distanceToTarget);
        await delay(interval);
      }
    },
  );
}

/**
 * Draw text based on the input configuration for one frame
 * @param config - configuration object
 */
export function draw3DText(config: Config): void {
  const { x, y, z, font, rgb, textOutline, text, perspectiveScale, scaleMultiplier } = config;
  const [onScreen, _x, _y] = World3dToScreen2d(x, y, z);
  if (!onScreen) return;

  const [p_x, p_y, p_z] = GetGameplayCamCoords();
  const distance = GetDistanceBetweenCoords(p_x, p_y, p_z, x, y, z, true);

  const fov = (1 / GetGameplayCamFov()) * 75;
  const scale = (1 / distance) * perspectiveScale * fov * scaleMultiplier;

  SetTextScale(0.0, scale);
  SetTextFont(font);
  SetTextProportional(true);
  SetTextColour(rgb[0], rgb[1], rgb[2], 255);
  if (textOutline) {
    SetTextOutline();
  }
  SetTextEntry('STRING');
  SetTextCentre(true);
  AddTextComponentString(text);
  DrawText(_x, _y);
}

/**
 * Draw text based on the input configuration. Will permanently exist
 * and will be visible as long as the player is in range.
 * @param config - Configuration object
 */
export function draw3DTextPermanent(config?: Config): void {
  return draw3DTextLoop(config);
}

/**
 * Draw text based on the input configuration. After the specified
 * timeout the text will disappear.
 * @param config - Configuration object
 */
export function draw3DTextTimeout(config?: Config): void {
  return draw3DTextLoop(config, true);
}


// function configureExports() {
//   return 1;
// }

async function configureExports() {
  // from this thread: https://forum.cfx.re/t/issues-when-calling-exported-client-function/170537/7
  // make sure the first server tick happens before we load these exports
  await delay(500);
  const _export = global.exports;
  _export('draw3DTextPermanent', (config: Config) => {
    draw3DTextPermanent(config);
  });

  _export('draw3DTextTimeout', (config: Config) => {
    draw3DTextTimeout(config);
  });

  _export('draw3DText', (config: Config) => {
    draw3DText(config);
  });
}

configureExports();

export default { draw3DText, draw3DTextPermanent, draw3DTextTimeout};