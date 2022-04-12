
function getRelativeTimeFormat(){
  return new Intl.RelativeTimeFormat("en", {
    localeMatcher: "best fit",
    numeric: "always",
    style: "short",
  });
}
const dateTimeFormatter = getRelativeTimeFormat();
function prettyDatetime(date){
  return date.toISOString().replace("T", " ").slice(0,-8);
}
function getRelativeDateStringToNow(date){
  const difference = Date.now() - date;

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY;

  let relativeDate;
  if(Math.abs(difference) < MINUTE){
    relativeDate = dateTimeFormatter.format(- difference / SECOND | 0, "seconds")
  } else if(Math.abs(difference) < HOUR){
    relativeDate = dateTimeFormatter.format(- difference / MINUTE | 0, "minutes")
  } else if(Math.abs(difference) < DAY){
    relativeDate = dateTimeFormatter.format(- difference / HOUR | 0, "hour")
  } else if(Math.abs(difference) < MONTH){
    relativeDate = dateTimeFormatter.format(- difference / DAY | 0, "day")
  } else {
    relativeDate = prettyDatetime(date);
  }
  return relativeDate;
}

class RelativeDateTimeElement extends HTMLElement {
  connectedCallback() {
    const date = new Date(this.getAttribute("title"));
    this.textContent = getRelativeDateStringToNow(date);
  }
}

if (!window.customElements.get('relative-datetime')) {
  window.RelativeDateTimeElement = RelativeDateTimeElement
  window.customElements.define('relative-datetime', RelativeDateTimeElement)
}