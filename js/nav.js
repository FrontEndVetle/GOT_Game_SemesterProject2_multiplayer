//check if user opens or close sidebar and if user are on mobile device or larger.

function openNav() {
    if (checkScreen.matches) {
        document.getElementById("sideBar").style.width = "100%";
    } else {
        document.getElementById("sideBar").style.width = "250px";
    }
}

function closeNav() {
    document.getElementById("sideBar").style.width = "0";
}
//check if user are on smaller device
var checkScreen = window.matchMedia("(max-width: 481px)");