// Planetary Hours -- Codex 144:99
// Gentle, ND-safe hourly tint based on Chaldean order.
// Modes:
//  - "clock": 24 fixed civil hours (midnight->midnight), seed by weekday ruler.
//  - "approxSolar": assumes sunrise≈06:00, sunset≈18:00, divides day/night into 12 hours each.
//
// Emits:
//   window.dispatchEvent(new CustomEvent("codex:set-planetary-hour",{detail:{planet,hourIndex,mode}}));
// Also calls PlanetaryLight.applyPlanet(...) if available.
//
// Configuration (optional, before this script runs):
//   window.CodexHours = { mode:"approxSolar" | "clock" }
//
// No external deps. ASCII-only.

(function(){
  var cfg = (window.CodexHours || {});
  var mode = cfg.mode || "clock";

  // Chaldean order
  var ORDER = ["Saturn","Jupiter","Mars","Sun","Venus","Mercury","Moon"];

  // Day rulers (hour 0 at sunrise belongs to day ruler)
  var DAY_RULER = {
    0:"Sun",     // Sunday
    1:"Moon",    // Monday
    2:"Mars",    // Tuesday
    3:"Mercury", // Wednesday
    4:"Jupiter", // Thursday
    5:"Venus",   // Friday
    6:"Saturn"   // Saturday
  };

  var timer = 0, lastKey = "";

  function chaldeanIndex(ofPlanet){
    for(var i=0;i<ORDER.length;i++) if(ORDER[i]===ofPlanet) return i;
    return 0;
  }

  function applyPlanet(planet, hourIndex){
    try {
      window.dispatchEvent(new CustomEvent("codex:set-planetary-hour",{
        detail:{ planet: planet, hourIndex: hourIndex, mode: mode }
      }));
    } catch(_){}

    // If PlanetaryLight is present, nudge palette
    try {
      if (window.PlanetaryLight && window.PlanetaryLight.applyPlanet) {
        window.PlanetaryLight.applyPlanet(planet);
      }
    } catch(_){}
  }

  function tick(){
    var now = new Date();
    var wd  = now.getDay(); // 0..6
    var h   = now.getHours();
    var m   = now.getMinutes();
    var key = "";

    if (mode === "clock"){
      // Fixed civil hours: seed sequence so that the hour containing 06:00 starts at the day ruler
      // Compute offset from 06:00, but use whole-day mapping for stability.
      var dayRuler = DAY_RULER[wd];
      var startIdx = chaldeanIndex(dayRuler);
      // Build 24-hour sequence by cycling ORDER starting at day ruler at 06:00
      // Hour at 06:00 → dayRuler; before 06:00 we step backwards; after we step forwards
      var civilHour = h; // 0..23
      var offsetFrom6 = civilHour - 6; // may be negative
      // Normalize to 0..23
      var idx = (startIdx + offsetFrom6) % ORDER.length;
      if (idx < 0) idx += ORDER.length;
      // The sequence repeats every 7 hours; we need to rotate by number of hours passed
      // We already adjusted by offsetFrom6; also add floor(m/60) which is 0
      var planet = ORDER[idx];
      key = mode + "|" + wd + "|" + civilHour;
      if (key !== lastKey){
        lastKey = key;
        applyPlanet(planet, civilHour);
      }
    } else {
      // approxSolar: split day 06:00–18:00 into 12 day hours, night 18:00–06:00 into 12 night hours
      var dayRuler2 = DAY_RULER[wd];
      var baseIdx   = chaldeanIndex(dayRuler2); // at sunrise hour 0 = day ruler
      var minutes = h*60 + m;

      var sunrise = 6*60;   // 06:00
      var sunset  = 18*60;  // 18:00

      var hourIndex = 0, planet2 = dayRuler2;
      if (minutes >= sunrise && minutes < sunset){
        var dayMin = minutes - sunrise;
        var dayHour = Math.floor(dayMin / ( (12*60)/12 )); // equal 60-min chunks
        hourIndex = dayHour; // 0..11
        planet2 = ORDER[(baseIdx + hourIndex) % ORDER.length];
      } else {
        // Night: starts at sunset with the next planet in sequence after the 11th day hour
        // Compute how many 60-min segments since sunset or before sunrise
        var nightMin = (minutes >= sunset) ? (minutes - sunset) : (minutes + (24*60 - sunset));
        var nightHour = Math.floor(nightMin / 60); // 0..11
        // Night begins with the planet after the last day hour (i.e., baseIdx+12)
        hourIndex = 12 + nightHour; // 12..23
        planet2 = ORDER[(baseIdx + hourIndex) % ORDER.length];
      }
      key = mode + "|" + wd + "|" + Math.floor(minutes/60);
      if (key !== lastKey){
        lastKey = key;
        applyPlanet(planet2, hourIndex);
      }
    }
  }

  function start(){
    stop();
    tick();
    timer = setInterval(tick, 60*1000); // check once per minute
  }
  function stop(){ if (timer) { clearInterval(timer); timer = 0; } }

  // Expose a tiny control
  window.CodexPlanetaryHours = { start:start, stop:stop, setMode:function(m){ mode = m||"clock"; lastKey=""; tick(); } };

  // Auto-start (safe: just color vars)
  start();
})();