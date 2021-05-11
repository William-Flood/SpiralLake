// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function loadList() {
    if (0 == $("#IndexMarker").length) {
        const homeForm = document.createElement("form");
        homeForm.method = "get";
        homeForm.action = "/Home/Index/" + $("#txtSearch").val();
        document.body.appendChild(homeForm);
        homeForm.submit();
    }
}

function hideAccountControlsIfNeeded() {
    if (!inAccountIcon && !inAccountControls && !$("#accountControls").hasClass("clickedOpen")) {
        $("#accountControls").slideUp();
    }
}

inAccountIcon = false;
inAccountControls = false;
$(document).ready(function () {
    if (0 == $("#IndexMarker").length) {
        $("#txtSearch").keyup(function (e) {
            if (e.keyCode == 13) {
                loadList();
            }
        });
    }
    $("#searchBar").click(function() {
        $("#searchBar").css("background-color", "#ffeee0");
        $("#txtSearch").focus();
    });
    $("#txtSearch").blur(function () {
        $("#searchBar").css("background-color", "initial");
    }); 
    $("#accountIcon").mouseover(function () {
        $("#accountControls").slideDown();
        inAccountIcon = true;
    });
    $("#accountControls").mouseover(function () {
        inAccountControls = true;
    });
    $("#accountIcon").mouseout(function () {
        inAccountIcon = false;
        setTimeout(hideAccountControlsIfNeeded, 500);
    });
    $("#accountControls").mouseout(function () {
        inAccountControls = false;
        setTimeout(hideAccountControlsIfNeeded, 500);
    });
    $("#accountIcon").click(function () {
        if ($("#accountControls").hasClass("clickedOpen")) {
            $("#accountControls").removeClass("clickedOpen");
            $("#accountControls").slideUp();
        } else {
            $("#accountControls").addClass("clickedOpen");
            $("#accountControls").slideDown();
        }
    });
});