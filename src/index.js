import "./script/main.tsx";
import attachFastClick from "fastclick";

// FastClick eliminates the 300ms delay between a physical tap and the firing of a click event on
// mobile browsers.
attachFastClick(document.body);
