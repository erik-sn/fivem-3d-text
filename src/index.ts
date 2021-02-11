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
const INTERVAL_INCREMENT = 50;
const MIN_SCALE_FACTOR = 100;
const MAX_SCALE_FACTOR = 10000;
const MIN_BACKOFF_TIME = 500;
const MAX_BACKOFF_TIME = 15000;

const DEFAULT_CONFIG: DefaultConfig = {
  rgb: [255, 255, 255],
  textOutline: true,
  scaleMultiplier: 1,
  font: 0,
  perspectiveScale: 4,
  radius: 15,
  timeout: 5000,
}


const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Get the distance from the player's position to the input coordinates
 * @param x - x coordinate
 * @param y - y coordinate
 * @param z - z coordinate
 */
function getDistanceToTarget(x: number, y: number, z: number): number {
  const [playerX, playerY , playerZ] = GetEntityCoords(PlayerPedId(), false);
  return Vdist2(playerX, playerY, playerZ, x, y, z);
}

/**
 * Determine if we are increasing or decreasing in distance and 
 * returns a value to change the next retry time by
 * @param distanceDelta - the difference in distance between previous and current
 * retry iteration
 */
function getRetryIncrement(distanceDelta: number): number {
  if (distanceDelta > 3) return INTERVAL_INCREMENT;
  if (distanceDelta < 0) return -INTERVAL_INCREMENT;
  return 0;
}

/**
 * Get the next retry interval based on current paramters
 * @param currentInterval - current interval in time
 * @param radius - radius set for this 3D text
 * @param distance - current distance from the target
 * @param previousDistance - previous distance from the target
 * @param retryCount - current retry count
 */
function getRetryTime(
  currentInterval: number,
  radius: number,
  distance: number,
  previousDistance: number,
  retryCount: number): number {
  const scaleFactor = distance / radius;
  if (scaleFactor > MAX_SCALE_FACTOR) return MAX_BACKOFF_TIME; // we're very far away now
  if (scaleFactor < MIN_SCALE_FACTOR) return MIN_BACKOFF_TIME; // we're relatively close

  const retryFactor = retryCount >= 10 ? 10 : retryCount; // exponentially increase as we change
  const delta = distance - previousDistance;
  const newInterval = currentInterval + retryFactor * getRetryIncrement(delta);
  return newInterval > MAX_BACKOFF_TIME ? MAX_BACKOFF_TIME : newInterval;
}

async function setDelay(interval: number): Promise<number> {
  if (interval > 0) {
    await delay(interval);
    return 1;
  }
  return 0;
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
  const _config = {...DEFAULT_CONFIG, ...config};
  const { x, y, z, radius } = _config;

  let interval = MIN_BACKOFF_TIME;
  let retryCount = 0;
  let previousDistanceToTarget = 0;
  let distanceToTarget = 0;

  let timeoutFinished = false;

  setTick(async (): Promise<void> => {
    previousDistanceToTarget = distanceToTarget;
    distanceToTarget = getDistanceToTarget(x, y, z);
    if (distanceToTarget >= radius) {  // we're out of range
      interval = getRetryTime(interval, radius, distanceToTarget, previousDistanceToTarget, retryCount);
      retryCount += await setDelay(interval);
      if (timeoutFinished === true) {
        timeoutFinished = false;
      }
    } else { // we're in range
      interval = 0;
      retryCount = 0;

      if (useTimeout) {
        if (timeoutFinished) return;
        setTimeout(() => {
          timeoutFinished = true;
        }, _config.timeout);
      }
  
      draw3DText(_config);
    }
  });
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

  
  SetTextScale(0.0, scale)
  SetTextFont(font)
  SetTextProportional(true)
  SetTextColour(rgb[0], rgb[1], rgb[2], 255)
  if (textOutline) {
    SetTextOutline()
  }
  SetTextEntry("STRING")
  SetTextCentre(true)
  AddTextComponentString(text)
  DrawText(_x, _y)
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
 * timeout the text will disappear until the player walks out of and
 * back into range.
 * @param config - Configuration object
 */
export function draw3DTextTimeout(config?: Config): void {
  return draw3DTextLoop(config, true);
}


// debug

// async function testDraw() {
//   const config = {
//     x: -1377.514282266,
//     y: -2852.64941406,
//     z: 13.9448,
//     text: 'Test',
//     radius: 15,
//   }
//   draw3DTextTimeout(config);
// }

// RegisterCommand('draw', testDraw, false);
