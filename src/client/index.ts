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

function getDistanceToTarget(x: number, y: number, z: number, radius: number): number {
  const [playerX, playerY , playerZ] = GetEntityCoords(PlayerPedId(), false);
  return Vdist2(playerX, playerY, playerZ, x, y, z);
}

function getRetryIncrement(delta) {
  if (delta > 5) return INTERVAL_INCREMENT;
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

function draw(config: Config) {
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


export function Draw3DTextPermanent(config?: Config): void {
  const _config = {...DEFAULT_CONFIG, ...config};
  const { x, y, z, radius } = _config;

  let _interval = 0;
  let _retryCount = 0;
  let _previousDistanceToTarget = 0;
  let _distanceToTarget = 0;

  setTick(async () => {
    if (_interval) {
      await delay(_interval);
      _retryCount += 1;
    }

    _previousDistanceToTarget = _distanceToTarget;
    _distanceToTarget = getDistanceToTarget(x, y, z, radius);
    const isWithinRange = _distanceToTarget <= radius;
    if (!isWithinRange) {
      _interval = getRetryTime(_interval, radius, _distanceToTarget, _previousDistanceToTarget, _retryCount);
      return;
    }

    // we're in range of the target
    _retryCount = 0;
    _interval = 0;

    draw(_config);
  });
}


async function testDraw() {
  const config = {
    x: -1377.514282266,
    y: -2852.64941406,
    z: 13.9448,
    text: 'Test',
    radius: 15,
  }
  Draw3DTextPermanent(config);
}

RegisterCommand('draw', testDraw, false);
