$.prototype.fadeIn = function () {
    this.css({ "opacity": "0%" });
    this.animate({ "opacity": "100%" }, { "duration": 400, queue: false});
    this.slideDown();
}

$.prototype.fadeOut = function () {
    this.animate({ "opacity": "0%" }, { "duration": 400, queue: false});
    this.slideUp();
}

function checkRegister() {
    if (
        $("#btnLogin").hasClass("register")
    ) {
        var TOSChecked = $("input[name='TOSAgreed']").is(":checked");
        var hasLower = /.*[a-z].*/.test($("input[name='Password']").val());
        var hasUpper = /.*[A-Z].*/.test($("input[name='Password']").val());
        var hasNumber = /.*[0-9].*/.test($("input[name='Password']").val());
        var passwordConfirmMatches = $("input[name = 'Password']").val() == $("input[name='ConfirmPassword']").val();
        var passwordLongEnough = 8 <= $("input[name='Password']").val().length;
        var emailIsValid = /^[\w\d\._\-]+@[\w\d\._\-]+\.[\w\d\._\-]+$/.test($("input[name='Email']").val());
        var userNameValid = /[\w\d_]+/.test($("input[name='UserName']").val());
        if (TOSChecked
            && hasLower
            && hasUpper
            && hasNumber
            && passwordConfirmMatches
            && passwordLongEnough
            && emailIsValid
            && userNameValid
        ) {
            $("#loginProceed").addClass("blueButton");
            $("#loginProceed").removeClass("greyedButton");
            $("#loginProceed").removeAttr("disabled");
        } else {
            $("#loginProceed").removeClass("blueButton");
            $("#loginProceed").addClass("greyedButton");
            $("#loginProceed").attr("disabled", "disabled");
        }
    } else {
        $("#loginProceed").addClass("blueButton");
        $("#loginProceed").removeClass("greyedButton");
        $("#loginProceed").removeAttr("disabled");
    }
}

function RegisterCancel() {
    $(".RegisterControl").fadeOut();
    $("#forgotPassword").fadeIn();
    $("#RegisterDiv").fadeIn();
    $("#btnLogin").val("Log In");
    $("#loginProceed").text("Log In");
    $("#btnLogin").removeClass("register");
    $("#navigate").attr("action", "/Welcome/Login");
    $("#loginFormElems").css({ "display": "block", "opacity": "100%"});
    checkRegister();
    $("#loginError").text("");
}

$(document).ready(function () {
    $("#login").click(function (e) {
        e.preventDefault();
        var targetWidth = 300;
        var targetLeft = Math.floor((window.innerWidth - targetWidth) / 2);
        $("#accessoptions").fadeOut();
        $("#logincontrols").fadeIn();
        $("#accesscontrols").animate({
            "left": targetLeft + "px",
            "width": "" + targetWidth + "px",
            "border-radius": "25px"
        }, {
            "duration": 400,
            "done": function () {
                $("#accesscontrols").css({ "left": "0px", "margin": "auto" });
            }
        });
    });
    $("#btnCancel").click(function (e) {
        $("#accessoptions").fadeIn();
        $("#logincontrols").fadeOut();
        var targetWidth = 300;
        var targetLeft = Math.floor((window.innerWidth - targetWidth) / 2);
        $("#accesscontrols").css({
            "left": targetLeft + "px",
            "margin": "0px"
        });
        $("#navigate").attr("action", "/Welcome/Login");
        $("#accesscontrols").animate({
            "left": 0 + "px",
            "width": "" + 200 + "px",
            "border-top-left-radius": "0px",
            "border-bottom-left-radius": "0px"
        }, {
            "duration": 400,
            "done": function () {
                $("#loginFormElems").show();
                $("#disclaimer").hide();
                RegisterCancel();
            }
        });
    });
    $("#Register").click(function (e) {
        e.preventDefault();
        $(".RegisterControl").fadeIn();
        $("#RegisterDiv").fadeOut();
        $("#btnLogin").val("Register");
        $("#loginProceed").text("Register");
        $("#btnLogin").addClass("register");
        $("#navigate").attr("action", "/Welcome/Register");
        $("#loginError").text("");
        $("#forgotPassword").fadeOut();
        checkRegister();
    });
    $("#RegisterCancel").click(function (e) {
        e.preventDefault();
        RegisterCancel();
    });
    $(".validator").change(function (e) {
        checkRegister();
    });
    $("#loginProceed").click(function () {
        if (
            $("#btnLogin").hasClass("register")
        ) {
            $("#loginFormElems").fadeOut();
            $("#disclaimer").fadeIn();
            $("#accesscontrols").animate({
                "width": "70%"
            }, {
                "duration": 400
            });
        } else {
            $.ajax({
                url: "/api/Login/",
                data: JSON.stringify({
                    UserName: $("input[name='UserName']").val(), "Password": $("input[name='Password']").val()
                }),
                contentType: "application/JSON",
                mimeType: "application/JSON",
                method: "POST",
                success: function (data) {
                    if ("Success" == data) {
                        $("#btnLogin").trigger("click");
                    } else {
                        $("#loginError").text("Login failure");
                    }
                }
            });
        }
    });
    $("#guest").click(function (e) {
        e.preventDefault();
        var targetLeft = Math.floor(window.innerWidth * .15);
        $("#navigate").attr("action", "/Welcome/Guest");
        $("#accessoptions").fadeOut();
        $("#logincontrols").fadeIn();
        $("#loginFormElems").hide();
        $("#disclaimer").show();
        $("#accesscontrols").animate({
            "left": targetLeft + "px",
            "width": "70%",
            "border-radius": "25px"
        }, {
            "duration": 400,
            "done": function () {
                $("#accesscontrols").css({ "left": "0px", "margin": "auto" });
            }
        });
    })
});