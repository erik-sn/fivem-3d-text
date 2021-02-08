interface DefaultConfig {
  rgb?: number[];
  textOutline?: boolean;
  scaleMultiplier?: number;
  font?: number;
  perspectiveScale?: number;
  radius?: number;
  timeout?: number;
}


interface Config extends DefaultConfig {
  x: number;
  y: number;
  z: number;
  text: string;
}

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

function getDistanceToTarget(x: number, y: number, z: number): number {
  const [playerX, playerY , playerZ] = GetEntityCoords(PlayerPedId(), false);
  return Vdist2(playerX, playerY, playerZ, x, y, z);
}

function getRetryIncrement(delta) {
  if (delta > 3) return INTERVAL_INCREMENT;
  if (delta < 0) return -INTERVAL_INCREMENT;
  return 0;
}

function getRetryTime(currentInterval, radius, distance, previousDistance, retryCount) {
  const scaleFactor = distance / radius;
  if (scaleFactor > MAX_SCALE_FACTOR) return MAX_BACKOFF_TIME; // we're very far away now
  if (scaleFactor < MIN_SCALE_FACTOR) return MIN_BACKOFF_TIME; // we're relatively close

  const retryFactor = retryCount >= 10 ? 10 : retryCount; // exponentially increase as we change
  const delta = distance - previousDistance;
  const newInterval = currentInterval + retryFactor * getRetryIncrement(delta);
  return newInterval > MAX_BACKOFF_TIME ? MAX_BACKOFF_TIME : newInterval;
}

function draw3DText(config: Config) {
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

async function setDelay(interval): Promise<number> {
  if (interval > 0) {
    await delay(interval);
    return 1;
  }
  return 0;
}


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


export function draw3DTextPermanent(config?: Config): void {
  return draw3DTextLoop(config);
}

export function draw3DTextTimeout(config?: Config): void {
  return draw3DTextLoop(config, true);
}


async function testDraw() {
  const config = {
    x: -1377.514282266,
    y: -2852.64941406,
    z: 13.9448,
    text: 'Test',
    radius: 15,
  }
  draw3DTextTimeout(config);
}

RegisterCommand('draw', testDraw, false);
