const numsEl = document.querySelector("#nums");
const baseButtonClasses = [
  "inline-flex",
  "h-20",
  "items-center",
  "justify-center",
  "px-6",
  "font-medium",
  "bg-neutral-950",
  "text-neutral-50",
];

const numButtonClasses = [
  ...baseButtonClasses,
  "rounded-md",
  "shadow-md",
  "transition",
  "active:scale-95",
  "cursor-pointer",
];

// const sendCommand = (cmd) => {
//   console.log(cmd);
// };

// Assuming SONY_TV_IP, SONY_TV_PRESHARED_KEY, SONY_TV_URL_PREFIX, SONY_TV_URL_SUFFIX, and commandToCode are defined elsewhere.

/**
 * Sends a command to the Sony TV using the modern Fetch API.
 * @param {string} command The command name (e.g., "VolumeUp").
 * @returns {Promise<void>} A Promise that resolves on successful command execution or rejects on error.
 */
const SONY_TV_IP = "192.168.1.224";
const SONY_TV_PRESHARED_KEY = "1234";
const SONY_TV_URL_PREFIX = "http://";
const SONY_TV_URL_SUFFIX = "/sony/IRCC";

async function sendCommand(code) {
  // 1. Initial checks
  if (!SONY_TV_IP || !SONY_TV_PRESHARED_KEY) {
    const message = "Error: No Sony TV IP or PreShared Key setup yet.";
    console.error(message);
    throw new Error(message);
  }
  // 2. Setup URL and data
  const tv_url = SONY_TV_URL_PREFIX + SONY_TV_IP + SONY_TV_URL_SUFFIX;
  const data = `<?xml version="1.0"?>
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <s:Body>
        <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">
          <IRCCCode>${code}</IRCCCode>
        </u:X_SendIRCC>
      </s:Body>
    </s:Envelope>`;

  // 3. Setup Fetch options
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
      // Note: The SOAPAction header value must be enclosed in " otherwise get an Invalid Action error from TV!
      SOAPACTION: '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
      "X-Auth-PSK": SONY_TV_PRESHARED_KEY,
      Connection: "Keep-Alive",
      Accept: "*/*",
    },
    body: data,
    // Note: The original XHR had a 3000ms timeout.
    // Fetch API doesn't support a direct timeout option.
    // To implement a timeout, you'd use an AbortController.
    // We'll add a basic AbortController implementation for a 3-second timeout.
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  fetchOptions.signal = controller.signal;

  try {
    // 4. Perform the fetch request
    const response = await fetch(tv_url, fetchOptions);

    // Clear the timeout as the request has completed (success or failure)
    clearTimeout(timeoutId);

    // 5. Check for HTTP status code errors (fetch only rejects on network errors or aborts)
    if (!response.ok) {
      // Get response text for error context
      const responseText = await response
        .text()
        .catch(() => "No response body available");

      const message =
        `Failed ${command} ${code} (Status ${response.status}): ` +
        `${tv_url} Key: ${SONY_TV_PRESHARED_KEY} (Response: "${responseText}")`;

      console.error(message);
      // Throwing the error here rejects the async function's promise
      throw new Error(message);
    }

    // 6. Success
    // console.log(`POST response received for: ${command} ${code}`);
    return; // The promise resolves implicitly when the function returns
  } catch (error) {
    // 7. Handle network errors or AbortController timeout/cancel
    clearTimeout(timeoutId); // Ensure timeout is cleared even on error

    // Special handling for AbortController timeout
    if (error.name === "AbortError") {
      const message = `Failed ${command} ${code}: Request timed out (3000ms).`;
      console.error(message);
      throw new Error(message);
    }

    // Re-throw other errors (like network issues)
    // The error is already logged from the 'if (!response.ok)' block if it was an HTTP error.
    throw error;
  }
}

const populateNums = () => {
  for (let i = 0; i < 10; i++) {
    const num = (i + 1) % 10;

    if (num === 0) {
      const padLeftOfZero = document.createElement("span");
      padLeftOfZero.classList.add(...baseButtonClasses, "opacity-0");
      numsEl.appendChild(padLeftOfZero);
    }

    const button = document.createElement("button");
    button.classList.add(...numButtonClasses);

    button.innerText = num;
    button.dataset.cmd = COMMAND_MAP[`Num${num}`];
    button.addEventListener("click", (e) => {
      sendCommand(e.target.dataset.cmd);
    });
    numsEl.appendChild(button);
  }
};

// Commands
const COMMAND_MAP = {};
COMMAND_MAP["Num1"] = "AAAAAQAAAAEAAAAAAw==";
COMMAND_MAP["Num2"] = "AAAAAQAAAAEAAAABAw==";
COMMAND_MAP["Num3"] = "AAAAAQAAAAEAAAACAw==";
COMMAND_MAP["Num4"] = "AAAAAQAAAAEAAAADAw==";
COMMAND_MAP["Num5"] = "AAAAAQAAAAEAAAAEAw==";
COMMAND_MAP["Num6"] = "AAAAAQAAAAEAAAAFAw==";
COMMAND_MAP["Num7"] = "AAAAAQAAAAEAAAAGAw==";
COMMAND_MAP["Num8"] = "AAAAAQAAAAEAAAAHAw==";
COMMAND_MAP["Num9"] = "AAAAAQAAAAEAAAAIAw==";
COMMAND_MAP["Num0"] = "AAAAAQAAAAEAAAAJAw==";
COMMAND_MAP["Num11"] = "AAAAAQAAAAEAAAAKAw==";
COMMAND_MAP["Num12"] = "AAAAAQAAAAEAAAALAw==";
COMMAND_MAP["Enter"] = "AAAAAQAAAAEAAAALAw==";
COMMAND_MAP["GGuide"] = "AAAAAQAAAAEAAAAOAw==";
COMMAND_MAP["ChannelUp"] = "AAAAAQAAAAEAAAAQAw==";
COMMAND_MAP["ChannelDown"] = "AAAAAQAAAAEAAAARAw==";
COMMAND_MAP["VolumeUp"] = "AAAAAQAAAAEAAAASAw==";
COMMAND_MAP["VolumeDown"] = "AAAAAQAAAAEAAAATAw==";
COMMAND_MAP["Mute"] = "AAAAAQAAAAEAAAAUAw==";
COMMAND_MAP["TvPower"] = "AAAAAQAAAAEAAAAVAw==";
COMMAND_MAP["Audio"] = "AAAAAQAAAAEAAAAXAw==";
COMMAND_MAP["MediaAudioTrack"] = "AAAAAQAAAAEAAAAXAw==";
COMMAND_MAP["Tv"] = "AAAAAQAAAAEAAAAkAw==";
COMMAND_MAP["Input"] = "AAAAAQAAAAEAAAAlAw==";
COMMAND_MAP["TvInput"] = "AAAAAQAAAAEAAAAlAw==";
COMMAND_MAP["TvAntennaCable"] = "AAAAAQAAAAEAAAAqAw==";
COMMAND_MAP["WakeUp"] = "AAAAAQAAAAEAAAAuAw==";
COMMAND_MAP["PowerOff"] = "AAAAAQAAAAEAAAAvAw==";
COMMAND_MAP["Sleep"] = "AAAAAQAAAAEAAAAvAw==";
COMMAND_MAP["Right"] = "AAAAAQAAAAEAAAAzAw==";
COMMAND_MAP["Left"] = "AAAAAQAAAAEAAAA0Aw==";
COMMAND_MAP["SleepTimer"] = "AAAAAQAAAAEAAAA2Aw==";
COMMAND_MAP["Analog2"] = "AAAAAQAAAAEAAAA4Aw==";
COMMAND_MAP["TvAnalog"] = "AAAAAQAAAAEAAAA4Aw==";
COMMAND_MAP["Display"] = "AAAAAQAAAAEAAAA6Aw==";
COMMAND_MAP["Jump"] = "AAAAAQAAAAEAAAA7Aw==";
COMMAND_MAP["PicOff"] = "AAAAAQAAAAEAAAA+Aw==";
COMMAND_MAP["PictureOff"] = "AAAAAQAAAAEAAAA+Aw==";
COMMAND_MAP["Teletext"] = "AAAAAQAAAAEAAAA/Aw==";
COMMAND_MAP["Video1"] = "AAAAAQAAAAEAAABAAw==";
COMMAND_MAP["Video2"] = "AAAAAQAAAAEAAABBAw==";
COMMAND_MAP["AnalogRgb1"] = "AAAAAQAAAAEAAABDAw==";
COMMAND_MAP["Home"] = "AAAAAQAAAAEAAABgAw==";
COMMAND_MAP["Exit"] = "AAAAAQAAAAEAAABjAw==";
COMMAND_MAP["PictureMode"] = "AAAAAQAAAAEAAABkAw==";
COMMAND_MAP["Confirm"] = "AAAAAQAAAAEAAABlAw==";
COMMAND_MAP["Up"] = "AAAAAQAAAAEAAAB0Aw==";
COMMAND_MAP["Down"] = "AAAAAQAAAAEAAAB1Aw==";
COMMAND_MAP["ClosedCaption"] = "AAAAAgAAAKQAAAAQAw==";
COMMAND_MAP["Component1"] = "AAAAAgAAAKQAAAA2Aw==";
COMMAND_MAP["Component2"] = "AAAAAgAAAKQAAAA3Aw==";
COMMAND_MAP["Wide"] = "AAAAAgAAAKQAAAA9Aw==";
COMMAND_MAP["EPG"] = "AAAAAgAAAKQAAABbAw==";
COMMAND_MAP["PAP"] = "AAAAAgAAAKQAAAB3Aw==";
COMMAND_MAP["TenKey"] = "AAAAAgAAAJcAAAAMAw==";
COMMAND_MAP["BSCS"] = "AAAAAgAAAJcAAAAQAw==";
COMMAND_MAP["Ddata"] = "AAAAAgAAAJcAAAAVAw==";
COMMAND_MAP["Stop"] = "AAAAAgAAAJcAAAAYAw==";
COMMAND_MAP["Pause"] = "AAAAAgAAAJcAAAAZAw==";
COMMAND_MAP["Play"] = "AAAAAgAAAJcAAAAaAw==";
COMMAND_MAP["Rewind"] = "AAAAAgAAAJcAAAAbAw==";
COMMAND_MAP["Forward"] = "AAAAAgAAAJcAAAAcAw==";
COMMAND_MAP["DOT"] = "AAAAAgAAAJcAAAAdAw==";
COMMAND_MAP["Rec"] = "AAAAAgAAAJcAAAAgAw==";
COMMAND_MAP["Return"] = "AAAAAgAAAJcAAAAjAw==";
COMMAND_MAP["Blue"] = "AAAAAgAAAJcAAAAkAw==";
COMMAND_MAP["Red"] = "AAAAAgAAAJcAAAAlAw==";
COMMAND_MAP["Green"] = "AAAAAgAAAJcAAAAmAw==";
COMMAND_MAP["Yellow"] = "AAAAAgAAAJcAAAAnAw==";
COMMAND_MAP["SubTitle"] = "AAAAAgAAAJcAAAAoAw==";
COMMAND_MAP["CS"] = "AAAAAgAAAJcAAAArAw==";
COMMAND_MAP["BS"] = "AAAAAgAAAJcAAAAsAw==";
COMMAND_MAP["Digital"] = "AAAAAgAAAJcAAAAyAw==";
COMMAND_MAP["Options"] = "AAAAAgAAAJcAAAA2Aw==";
COMMAND_MAP["Media"] = "AAAAAgAAAJcAAAA4Aw==";
COMMAND_MAP["Prev"] = "AAAAAgAAAJcAAAA8Aw==";
COMMAND_MAP["Next"] = "AAAAAgAAAJcAAAA9Aw==";
COMMAND_MAP["DpadCenter"] = "AAAAAgAAAJcAAABKAw==";
COMMAND_MAP["CursorUp"] = "AAAAAgAAAJcAAABPAw==";
COMMAND_MAP["CursorDown"] = "AAAAAgAAAJcAAABQAw==";
COMMAND_MAP["CursorLeft"] = "AAAAAgAAAJcAAABNAw==";
COMMAND_MAP["CursorRight"] = "AAAAAgAAAJcAAABOAw==";
COMMAND_MAP["ShopRemoteControlForcedDynamic"] = "AAAAAgAAAJcAAABqAw==";
COMMAND_MAP["FlashPlus"] = "AAAAAgAAAJcAAAB4Aw==";
COMMAND_MAP["FlashMinus"] = "AAAAAgAAAJcAAAB5Aw==";
COMMAND_MAP["AudioQualityMode"] = "AAAAAgAAAJcAAAB7Aw==";
COMMAND_MAP["DemoMode"] = "AAAAAgAAAJcAAAB8Aw==";
COMMAND_MAP["Analog"] = "AAAAAgAAAHcAAAANAw==";
COMMAND_MAP["Mode3D"] = "AAAAAgAAAHcAAABNAw==";
COMMAND_MAP["DigitalToggle"] = "AAAAAgAAAHcAAABSAw==";
COMMAND_MAP["DemoSurround"] = "AAAAAgAAAHcAAAB7Aw==";
COMMAND_MAP["*AD"] = "AAAAAgAAABoAAAA7Aw==";
COMMAND_MAP["AudioMixUp"] = "AAAAAgAAABoAAAA8Aw==";
COMMAND_MAP["AudioMixDown"] = "AAAAAgAAABoAAAA9Aw==";
COMMAND_MAP["PhotoFrame"] = "AAAAAgAAABoAAABVAw==";
COMMAND_MAP["Tv_Radio"] = "AAAAAgAAABoAAABXAw==";
COMMAND_MAP["SyncMenu"] = "AAAAAgAAABoAAABYAw==";
COMMAND_MAP["Hdmi1"] = "AAAAAgAAABoAAABaAw==";
COMMAND_MAP["Hdmi2"] = "AAAAAgAAABoAAABbAw==";
COMMAND_MAP["Hdmi3"] = "AAAAAgAAABoAAABcAw==";
COMMAND_MAP["Hdmi4"] = "AAAAAgAAABoAAABdAw==";
COMMAND_MAP["TopMenu"] = "AAAAAgAAABoAAABgAw==";
COMMAND_MAP["PopUpMenu"] = "AAAAAgAAABoAAABhAw==";
COMMAND_MAP["OneTouchTimeRec"] = "AAAAAgAAABoAAABkAw==";
COMMAND_MAP["OneTouchView"] = "AAAAAgAAABoAAABlAw==";
COMMAND_MAP["DUX"] = "AAAAAgAAABoAAABzAw==";
COMMAND_MAP["FootballMode"] = "AAAAAgAAABoAAAB2Aw==";
COMMAND_MAP["iManual"] = "AAAAAgAAABoAAAB7Aw==";
COMMAND_MAP["Netflix"] = "AAAAAgAAABoAAAB8Aw==";
COMMAND_MAP["Assists"] = "AAAAAgAAAMQAAAA7Aw==";
COMMAND_MAP["ActionMenu"] = "AAAAAgAAAMQAAABLAw==";
COMMAND_MAP["Help"] = "AAAAAgAAAMQAAABNAw==";
COMMAND_MAP["TvSatellite"] = "AAAAAgAAAMQAAABOAw==";
COMMAND_MAP["WirelessSubwoofer"] = "AAAAAgAAAMQAAAB+Aw==";

document.querySelector("#power").addEventListener("click", () => {
  sendCommand(COMMAND_MAP.TvPower);
});

const volButtons = document.querySelectorAll("#vol button");

volButtons[0].addEventListener("click", () => {
  sendCommand(COMMAND_MAP.VolumeUp);
});
volButtons[1].addEventListener("click", () => {
  sendCommand(COMMAND_MAP.VolumeDown);
});

const chButtons = document.querySelectorAll("#ch button");

chButtons[0].addEventListener("click", () => {
  sendCommand(COMMAND_MAP.ChannelUp);
});
chButtons[1].addEventListener("click", () => {
  sendCommand(COMMAND_MAP.ChannelDown);
});

populateNums();
