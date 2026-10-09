const state = JSON.parse(localStorage.getItem("session-check-in") || "{}" );
const checks = [document.querySelector("#ackButton"), document.querySelector("#newsButton")];
const sessionOptions = document.querySelectorAll(".session-option");
const dailyAssets = document.querySelectorAll("[data-daily-asset]");
const phaseAssets = document.querySelectorAll("[data-phase-asset]");
const dailyFieldOptions = {
  sentiment: ["Bullish", "Bearish", "Unclear"],
  pdSweep: ["PDL", "PDH", "Both", "Inside Bar"],
  newDayBias: ["Bullish", "Bearish", "Unclear"]
};
const phaseOptions = ["Building LQ", "Approaching Inducement/Trap LQ Level", "Just Induced/Trapped", "Induced/Trapped & Moved Away"];
const phaseFieldOptions = {
  approachingTrapSide: ["Trapping Buyers", "Trapping Sellers"],
  lbStatus: ["LB on left", "No LB yet"],
  trappedTraders: ["Trapped Buyers", "Trapped Sellers"],
  lowerTimeframeAlignment: ["Yes", "No"]
};
const tradeButtons = document.querySelectorAll(".trade-button");
const themeButton = document.querySelector("#themeButton");
const calmButton = document.querySelector("#calmButton");
const breathingMode = document.querySelector("#breathingMode");
const breathingPhaseSteps = document.querySelectorAll("#breathingPhase .breathing-step");
const returnButton = document.querySelector("#returnButton");
const startButton = document.querySelector("#startButton");
const breakButton = document.querySelector("#breakButton");
const breakSuggestions = document.querySelector("#breakSuggestions");
const suggestionButtons = document.querySelectorAll(".suggestion-button");
const completeButton = document.querySelector("#completeButton");
const resetButtons = document.querySelectorAll("#resetButton, #resetBottomButton");
const setupRating = document.querySelector("#setupRating");
const setupRatingOptions = document.querySelectorAll(".setup-rating-option");
const setupRatingMessage = document.querySelector("#setupRatingMessage");
const tradeCheckins = document.querySelector("#tradeCheckins");
const afterSession = document.querySelector("#afterSession");
const routineCount = document.querySelector("#routineCount");
const statusMessage = document.querySelector("#statusMessage");
const noteInput = document.querySelector("#noteInput");
const reportButton = document.querySelector("#reportButton");
const reportResult = document.querySelector("#reportResult");
const reportImage = document.querySelector("#reportImage");
const copyReportButton = document.querySelector("#copyReportButton");
const downloadReportLink = document.querySelector("#downloadReportLink");
const reportStatus = document.querySelector("#reportStatus");
let reportBlob;
let reportObjectUrl;
const moodGroups = ["arrival", "trade1", "trade2", "after"];
const riskyEmotions = ["On edge", "Uncertain", "Anxious", "Frustrated", "Greedy", "Angry", "Disappointed", "Fearful", "Impatient", "Impulsive", "Tired", "Distracted", "Revengeful", "Hesitant"];
const emotionOptions = [
  "Focused", "Calm", "Confident", "Happy", "Patient", "On edge", "Uncertain", "Anxious", "Frustrated", "Greedy",
  "Angry", "Disappointed", "Fearful", "Impatient", "Impulsive", "Hopeful", "Tired", "Distracted", "Revengeful", "Hesitant"
];

state.checks = Array.isArray(state.checks) ? [Boolean(state.checks[0]), Boolean(state.checks[1])] : [false, false];
const legacyDirections = state.directions && typeof state.directions === "object" ? state.directions : {};
const legacyAlignment = state.alignment && typeof state.alignment === "object" ? state.alignment : {};
const legacyHtfAnalysis = state.htfAnalysis && typeof state.htfAnalysis === "object" && !Array.isArray(state.htfAnalysis) ? state.htfAnalysis : {};
const savedDailyAnalysis = state.dailyAnalysis && typeof state.dailyAnalysis === "object" && !Array.isArray(state.dailyAnalysis) ? state.dailyAnalysis : {};
state.dailyAnalysis = {};
state.htfAnalysis = {};
["GC", "NQ"].forEach((asset) => {
  const savedDaily = savedDailyAnalysis[asset] && typeof savedDailyAnalysis[asset] === "object" ? savedDailyAnalysis[asset] : {};
  const savedHtf = legacyHtfAnalysis[asset] && typeof legacyHtfAnalysis[asset] === "object" ? legacyHtfAnalysis[asset] : {};
  const trappedTraders = savedHtf.trappedTraders || legacyDirections[asset]?.trapped || "";
  const lowerTimeframeAlignment = savedHtf.lowerTimeframeAlignment || legacyAlignment[asset] || "";
  const legacyTrappedTraders = trappedTraders === "Buyers" ? "Trapped Buyers" : trappedTraders === "Sellers" ? "Trapped Sellers" : trappedTraders;
  state.dailyAnalysis[asset] = {
    sentiment: dailyFieldOptions.sentiment.includes(savedDaily.sentiment) ? savedDaily.sentiment : "",
    pdSweep: dailyFieldOptions.pdSweep.includes(savedDaily.pdSweep || savedHtf.pdSweep) ? (savedDaily.pdSweep || savedHtf.pdSweep) : "",
    newDayBias: dailyFieldOptions.newDayBias.includes(savedDaily.newDayBias) ? savedDaily.newDayBias : "",
    potentialHighLowEvaluated: Boolean(savedDaily.potentialHighLowEvaluated ?? savedHtf.dailyCandleLocationEvaluated)
  };
  state.htfAnalysis[asset] = {
    phase: phaseOptions.includes(savedHtf.phase) ? savedHtf.phase : "",
    buildingLqAlertsSet: Boolean(savedHtf.buildingLqAlertsSet),
    evaluatedLtfForLbLq: Boolean(savedHtf.evaluatedLtfForLbLq),
    approachingTrapSide: phaseFieldOptions.approachingTrapSide.includes(savedHtf.approachingTrapSide) ? savedHtf.approachingTrapSide : "",
    lbStatus: phaseFieldOptions.lbStatus.includes(savedHtf.lbStatus) ? savedHtf.lbStatus : "",
    trappedTraders: phaseFieldOptions.trappedTraders.includes(legacyTrappedTraders) ? legacyTrappedTraders : "",
    evaluatingEntry: Boolean(savedHtf.evaluatingEntry),
    lowerTimeframeAlignment: phaseFieldOptions.lowerTimeframeAlignment.includes(lowerTimeframeAlignment) ? lowerTimeframeAlignment : "",
    opposingLqNotTaken: Boolean(savedHtf.opposingLqNotTaken),
    trendLinesEvaluated: Boolean(savedHtf.trendLinesEvaluated ?? savedHtf.htfLtfTrendLineEvaluated)
  };
});
delete state.directions;
delete state.alignment;
if (!state.sessionChoiceInitialized) {
  state.session = "";
  state.sessionChoiceInitialized = true;
  localStorage.setItem("session-check-in", JSON.stringify(state));
}
state.moods = state.moods || {};
moodGroups.forEach((group) => {
  state.moods[group] = Array.isArray(state.moods[group]) ? state.moods[group] : state.moods[group] ? [state.moods[group]] : [];
  state.moods[group] = state.moods[group].map((emotion) => {
    if (emotion === "Bored") return "Tired";
    if (emotion === "Restless") return "On edge";
    if (emotion === "Overconfident") return "Impulsive";
    return emotion;
  });
});
state.trades = state.trades || {};
state.setupRating = state.setupRating || "";
state.theme = state.theme || "light";

function createMoodButtons() {
  moodGroups.forEach((group) => {
    const grid = document.querySelector(`#${group === "arrival" ? "arrival" : group}MoodGrid`);
    grid.innerHTML = emotionOptions.map((label) => `<button class="mood" type="button" data-mood-group="${group}" data-mood="${label}" aria-label="${label}">${label}</button>`).join("");
  });
}

function saveState() {
  localStorage.setItem("session-check-in", JSON.stringify(state));
}

function render() {
  checks.forEach((button, index) => {
    const active = Boolean(state.checks?.[index]);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".mood").forEach((button) => button.setAttribute("aria-pressed", String(state.moods[button.dataset.moodGroup].includes(button.dataset.mood))));
  sessionOptions.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.session === state.session)));
  tradeButtons.forEach((button) => {
    const active = button.dataset.trade === state.activeTrade;
    button.setAttribute("aria-pressed", String(active));
    document.querySelector(`#${button.dataset.trade}Panel`).hidden = !active;
  });
  document.documentElement.dataset.theme = state.theme;
  dailyAssets.forEach((assetElement) => {
    const asset = state.dailyAnalysis[assetElement.dataset.dailyAsset];
    assetElement.querySelectorAll("[data-daily-field]").forEach((field) => {
      const value = asset[field.dataset.dailyField];
      if (field.type === "checkbox") {
        field.checked = value;
      } else {
        field.value = value;
      }
    });
  });
  phaseAssets.forEach((assetElement) => {
    const asset = state.htfAnalysis[assetElement.dataset.phaseAsset];
    assetElement.querySelectorAll("[data-phase-field]").forEach((field) => {
      const value = asset[field.dataset.phaseField];
      if (field.type === "checkbox") {
        field.checked = value;
      } else {
        field.value = value;
      }
    });
    assetElement.querySelectorAll("[data-phase-content]").forEach((content) => {
      content.hidden = content.dataset.phaseContent !== asset.phase;
    });
  });
  themeButton.textContent = state.theme === "dark" ? "☼" : "☾";
  themeButton.setAttribute("aria-label", state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  setupRating.hidden = !state.sessionStarted;
  setupRatingOptions.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.rating === state.setupRating)));
  const setupMessages = {
    "A+": "This is a strong setup. Stay patient and execute your plan.",
    "B+": "It may be best to wait for a more ideal setup or trade with smaller size.",
    C: "This is not a trade we want to take. Protect your capital and pass."
  };
  setupRatingMessage.hidden = !state.setupRating;
  setupRatingMessage.textContent = setupMessages[state.setupRating] || "";
  setupRatingMessage.dataset.rating = state.setupRating;
  tradeCheckins.hidden = !state.sessionStarted;
  completeButton.hidden = !state.sessionStarted;
  completeButton.setAttribute("aria-pressed", String(Boolean(state.sessionCompleted)));
  afterSession.hidden = !state.sessionCompleted;
  noteInput.value = state.note || "";
  const completedChecks = state.checks.filter(Boolean).length;
  routineCount.textContent = `${completedChecks} / 2`;
  const readyToStart = completedChecks === 2 && state.moods.arrival.length > 0;
  startButton.disabled = !readyToStart || state.sessionStarted;
  startButton.textContent = state.sessionStarted ? "Session in progress" : "Start session";
  breakButton.textContent = state.takingBreak ? "Break noted for today" : "Taking a break today";
  breakButton.setAttribute("aria-pressed", String(Boolean(state.takingBreak)));
  breakSuggestions.hidden = !state.takingBreak;
  suggestionButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.suggestion === state.breakSuggestion)));
  statusMessage.textContent = state.takingBreak ? (state.breakSuggestion ? `${state.breakSuggestion} sounds good. Take the time you need.` : "Good call. Rest is part of the process.") : state.sessionStarted ? "Stay with your plan. Check back in when you are done." : readyToStart ? `${state.moods.arrival.join(" + ")} noted. You are ready.` : completedChecks === 2 ? "Select at least one arrival emotion to begin." : "I'm proud of you for showing up for yourself.";
  statusMessage.classList.toggle("ready", readyToStart);
  moodGroups.forEach((group) => {
    const reminder = document.querySelector(`#${group}Reminder`);
    if (!reminder) return;
    const needsReminder = group !== "after" && state.moods[group].some((emotion) => riskyEmotions.includes(emotion));
    reminder.hidden = !needsReminder;
    reminder.textContent = group === "arrival" ? "A gentle check-in: it is okay not to trade today. Protecting your state is part of the process." : "Whatever you're feeling is okay. Notice it, take a breath, and stay connected to your plan.";
  });
}

checks.forEach((button, index) => button.addEventListener("click", () => {
  state.checks = state.checks || [false, false];
  state.checks[index] = !state.checks[index];
  saveState();
  render();
}));

function attachMoodListeners() {
  document.querySelectorAll(".mood").forEach((button) => button.addEventListener("click", () => {
  const group = button.dataset.moodGroup;
  const selected = state.moods[group];
  state.moods[group] = selected.includes(button.dataset.mood) ? selected.filter((emotion) => emotion !== button.dataset.mood) : [...selected, button.dataset.mood];
  saveState();
  render();
  }));
}

sessionOptions.forEach((button) => button.addEventListener("click", () => {
  state.session = button.dataset.session;
  saveState();
  render();
}));

dailyAssets.forEach((assetElement) => {
  assetElement.querySelectorAll("[data-daily-field]").forEach((field) => field.addEventListener("change", () => {
    state.dailyAnalysis[assetElement.dataset.dailyAsset][field.dataset.dailyField] = field.type === "checkbox" ? field.checked : field.value;
    saveState();
    render();
  }));
});

phaseAssets.forEach((assetElement) => {
  assetElement.querySelectorAll("[data-phase-field]").forEach((field) => field.addEventListener("change", () => {
    state.htfAnalysis[assetElement.dataset.phaseAsset][field.dataset.phaseField] = field.type === "checkbox" ? field.checked : field.value;
    saveState();
    render();
  }));
});

tradeButtons.forEach((button) => button.addEventListener("click", () => {
  state.activeTrade = state.activeTrade === button.dataset.trade ? "" : button.dataset.trade;
  saveState();
  render();
}));

themeButton.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState();
  render();
});

let breathingPhaseTimer;
let breathingPhaseIndex = 0;
const breathingPhases = ["Breathe in", "Hold", "Breathe out", "Rest"];
const breathingPhaseDurations = [4000, 3000, 4000, 3000];

function updateBreathingPhase() {
  const activePhase = breathingPhases[breathingPhaseIndex];
  breathingPhaseSteps.forEach((step) => {
    const isActive = step.dataset.phase === activePhase;
    step.classList.toggle("active", isActive);
    step.setAttribute("aria-current", isActive ? "step" : "false");
  });
  breathingPhaseIndex = (breathingPhaseIndex + 1) % breathingPhases.length;
  breathingPhaseTimer = window.setTimeout(updateBreathingPhase, breathingPhaseDurations[breathingPhaseIndex]);
}

function closeBreathingMode() {
  window.clearTimeout(breathingPhaseTimer);
  breathingMode.hidden = true;
  breathingMode.classList.remove("breathing-running");
  document.body.classList.remove("breathing-active");
  calmButton.focus();
}

function openBreathingMode() {
  breathingPhaseIndex = 0;
  breathingMode.hidden = false;
  breathingMode.classList.add("breathing-running");
  updateBreathingPhase();
  document.body.classList.add("breathing-active");
  returnButton.focus();
}

calmButton.addEventListener("click", openBreathingMode);
returnButton.addEventListener("click", closeBreathingMode);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !breathingMode.hidden) closeBreathingMode();
});

noteInput.addEventListener("input", () => {
  state.note = noteInput.value;
  saveState();
});

startButton.addEventListener("click", () => {
  state.sessionStarted = true;
  state.sessionCompleted = false;
  state.takingBreak = false;
  saveState();
  render();
  startButton.disabled = true;
});

completeButton.addEventListener("click", () => {
  state.sessionCompleted = !state.sessionCompleted;
  saveState();
  render();
});

breakButton.addEventListener("click", () => {
  state.takingBreak = !state.takingBreak;
  state.sessionStarted = false;
  state.sessionCompleted = false;
  if (!state.takingBreak) state.breakSuggestion = "";
  saveState();
  render();
});

suggestionButtons.forEach((button) => button.addEventListener("click", () => {
  state.breakSuggestion = state.breakSuggestion === button.dataset.suggestion ? "" : button.dataset.suggestion;
  saveState();
  render();
}));

setupRatingOptions.forEach((button) => button.addEventListener("click", () => {
  state.setupRating = state.setupRating === button.dataset.rating ? "" : button.dataset.rating;
  saveState();
  render();
}));

function wrapReportText(context, text, maxWidth) {
  const words = String(text).split(" ");
  let line = "";
  const lines = [];
  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawReportText(context, text, x, y, maxWidth, lineHeight) {
  const lines = wrapReportText(context, text, maxWidth);
  lines.forEach((currentLine, index) => context.fillText(currentLine, x, y + index * lineHeight));
  return y + Math.max(lines.length, 1) * lineHeight;
}

function reportValue(value) {
  return value?.length ? value.join(" + ") : "None recorded";
}

function createReportImage() {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const padding = 78;
  const lineHeight = 32;
  const dailyReport = ["GC", "NQ"].map((asset) => {
    const analysis = state.dailyAnalysis[asset];
    return `${asset}: Overall sentiment: ${analysis.sentiment || "Not selected"}; PDL/PDH swept: ${analysis.pdSweep || "Not selected"}; New Day bias: ${analysis.newDayBias || "Not selected"}; Potential new Daily candle high/low evaluated: ${analysis.potentialHighLowEvaluated ? "Yes" : "No"}`;
  }).join("; ");
  const htfReport = ["GC", "NQ"].map((asset) => {
    const analysis = state.htfAnalysis[asset];
    const phaseDetails = {
      "Building LQ": `HTF alerts set at LQ levels: ${analysis.buildingLqAlertsSet ? "Yes" : "No"}; LTF (M5/M15) evaluated for LB/LQ: ${analysis.evaluatedLtfForLbLq ? "Yes" : "No"}`,
      "Approaching Inducement/Trap LQ Level": `Trapping: ${analysis.approachingTrapSide || "Not selected"}; LB status: ${analysis.lbStatus || "Not selected"}`,
      "Just Induced/Trapped": `Trapped: ${analysis.trappedTraders || "Not selected"}; Evaluating for direct (HTF) or confirmation (LTF) entry: ${analysis.evaluatingEntry ? "Yes" : "No"}`,
      "Induced/Trapped & Moved Away": `Trapped: ${analysis.trappedTraders || "Not selected"}; M5/M15 LB aligned with HTF LB: ${analysis.lowerTimeframeAlignment || "Not selected"}; Opposing LQ not yet taken: ${analysis.opposingLqNotTaken ? "Yes" : "No"}; HTF + LTF trend lines evaluated for confluence: ${analysis.trendLinesEvaluated ? "Yes" : "No"}`
    }[analysis.phase] || "";
    return `${asset}: Phase: ${analysis.phase || "Not selected"}${phaseDetails ? `; ${phaseDetails}` : ""}`;
  }).join("; ");
  const sections = [
    ["Trading session", state.session || "Not selected"],
    ["Daily Chart Analysis", dailyReport],
    ["HTF Phase of Price (H1/H4)", htfReport],
    ["Arrival emotions", reportValue(state.moods.arrival)],
    ["Trade setup rating", state.setupRating || "Not rated"],
    ["After-session emotions", reportValue(state.moods.after)],
    ["Notes", state.note?.trim() || "No notes added"]
  ];
  if (state.moods.trade1.length > 0 || state.moods.trade2.length > 0) {
    sections.splice(2, 0, ["Trade 1 emotions", reportValue(state.moods.trade1)], ["Trade 2 emotions", reportValue(state.moods.trade2)]);
  }
  canvas.width = width;
  const context = canvas.getContext("2d");
  context.font = "500 22px Manrope, sans-serif";
  const contentWidth = width - padding * 2 - 76;
  const canvasHeight = Math.max(416, 330 + sections.reduce((height, [, value]) => height + 80 + wrapReportText(context, value, contentWidth).length * lineHeight, 0));
  canvas.height = canvasHeight;
  const isLight = state.theme === "light";
  const colors = isLight ? { background: "#f4f7f3", ink: "#18221e", muted: "#64736a", accent: "#b36f25", line: "#d5ded8", panel: "#e8eeea" } : { background: "#131b19", ink: "#e8eee8", muted: "#8f9b92", accent: "#e5ad62", line: "#283530", panel: "#17211e" };
  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, canvasHeight);
  context.fillStyle = colors.panel;
  context.fillRect(padding, 54, width - padding * 2, canvasHeight - 108);
  context.fillStyle = colors.accent;
  context.fillRect(padding, 54, 12, 104);
  context.font = "700 22px Manrope, sans-serif";
  context.fillText("TRADING COMPANION", padding + 38, 102);
  context.font = "800 48px Manrope, sans-serif";
  context.fillStyle = colors.ink;
  context.fillText("Session check-in", padding + 38, 154);
  context.font = "500 18px DM Mono, monospace";
  context.fillStyle = colors.muted;
  context.fillText(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), padding + 38, 194);
  let y = 270;
  sections.forEach(([label, value]) => {
    context.strokeStyle = colors.line;
    context.beginPath();
    context.moveTo(padding + 38, y - 22);
    context.lineTo(width - padding - 38, y - 22);
    context.stroke();
    context.font = "700 17px Manrope, sans-serif";
    context.fillStyle = colors.accent;
    context.fillText(label.toUpperCase(), padding + 38, y + 10);
    context.font = "500 22px Manrope, sans-serif";
    context.fillStyle = colors.ink;
    y = drawReportText(context, value, padding + 38, y + 46, width - padding * 2 - 76, lineHeight) + 34;
  });
  return canvas;
}

async function copyReportImage() {
  if (!reportBlob || !navigator.clipboard || !window.ClipboardItem) {
    reportStatus.textContent = "Copying images is unavailable in this browser. Use Download image instead.";
    return false;
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": reportBlob })]);
    reportStatus.textContent = "Report image copied to your clipboard.";
    return true;
  } catch (error) {
    reportStatus.textContent = "Copying was blocked by the browser. Use Download image instead.";
    return false;
  }
}

reportButton.addEventListener("click", () => {
  reportButton.disabled = true;
  reportStatus.textContent = "Creating your report...";
  const canvas = createReportImage();
  canvas.toBlob(async (blob) => {
    if (!blob) {
      reportStatus.textContent = "The report could not be created. Please try again.";
      reportButton.disabled = false;
      return;
    }
    reportBlob = blob;
    if (reportObjectUrl) URL.revokeObjectURL(reportObjectUrl);
    reportObjectUrl = URL.createObjectURL(blob);
    reportImage.src = reportObjectUrl;
    downloadReportLink.href = reportObjectUrl;
    reportResult.hidden = false;
    await copyReportImage();
    reportButton.disabled = false;
  }, "image/png");
});

copyReportButton.addEventListener("click", copyReportImage);

function resetSession() {
  localStorage.removeItem("session-check-in");
  state.checks = [false, false];
  state.dailyAnalysis = {
    GC: { sentiment: "", pdSweep: "", newDayBias: "", potentialHighLowEvaluated: false },
    NQ: { sentiment: "", pdSweep: "", newDayBias: "", potentialHighLowEvaluated: false }
  };
  state.htfAnalysis = {
    GC: { phase: "", buildingLqAlertsSet: false, evaluatedLtfForLbLq: false, approachingTrapSide: "", lbStatus: "", trappedTraders: "", evaluatingEntry: false, lowerTimeframeAlignment: "", opposingLqNotTaken: false, trendLinesEvaluated: false },
    NQ: { phase: "", buildingLqAlertsSet: false, evaluatedLtfForLbLq: false, approachingTrapSide: "", lbStatus: "", trappedTraders: "", evaluatingEntry: false, lowerTimeframeAlignment: "", opposingLqNotTaken: false, trendLinesEvaluated: false }
  };
  state.session = "";
  state.sessionChoiceInitialized = true;
  state.moods = { arrival: [], trade1: [], trade2: [], after: [] };
  state.trades = {};
  state.activeTrade = "";
  state.setupRating = "";
  state.sessionStarted = false;
  state.sessionCompleted = false;
  state.takingBreak = false;
  state.breakSuggestion = "";
  state.note = "";
  render();
}

resetButtons.forEach((button) => button.addEventListener("click", resetSession));

createMoodButtons();
attachMoodListeners();
render();