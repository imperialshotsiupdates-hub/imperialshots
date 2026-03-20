/* ===== THEME APPLY ===== */

let theme = localStorage.getItem("theme")

if(theme){
document.body.setAttribute("data-theme",theme)
}

/* ===== LANGUAGE APPLY ===== */

function googleTranslateElementInit(){
new google.translate.TranslateElement(
{pageLanguage:'en'},
'google_translate_element'
)
}