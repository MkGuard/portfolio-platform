const checkSession = async () => {
  try {
    const response = await fetch("/check");
    if (!response.ok) throw new Error(`Failed to check session: ${response.status}`);
    const { success, id } = await response.json();
    $("#loginForm").removeClass("codeRequested");
    $("#2FABox").removeClass("ready");
    if (success) {
      $("body").addClass("logged");
      $("#userId").text(id);
      $("#loginPage").hide();
      $("#homePage").show();
    } else {
      $("body").removeClass("logged");
      $("#userId").text("");
    }
  } catch (err) {
    console.error("Error checking session:", err.message);
    $("body").removeClass("logged");
  }
};

jQuery(document).ready(($) => {
  checkSession();

  $("#logoutButton").click(async () => {
    await fetch(`/logout`);
    await checkSession();
  });

  $("#loginForm").submit(async (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    const password = e.target.password.value;
    const code = e.target.code.value;
  
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        password: password,
        code: code,
      }),
    });
  
    const data = await response.json();
  
    if (data.success) {
      if (data.codeRequested) {
        
        $("#loginForm").addClass("codeRequested");
      } else {
        $("#loginForm").trigger("reset");
        await checkSession(); 
      }
    } else {
      alert(data.error || "Login failed");
    }
  });
  

  $("#enable2FAButton").click(async () => {
    const response = await fetch("/qrImage");
    const { image, success } = await response.json();
    if (success) {
      $("#qrImage").attr("src", image);
      $("#2FABox").addClass("ready");
    } else {
      alert("Unable to fetch the QR image");
    }
  });

  $("#twoFAUpdateForm").submit(async (e) => {
    e.preventDefault();
    const code = e.target.code.value;
    const response = await fetch("/set2FA?code=" + code);
    const { success } = await response.json();
    if (success) {
      alert("SUCCESS: 2FA enabled/updated");
    } else {
      alert("ERROR: Unable to update/enable 2FA");
    }
    $("#twoFAUpdateForm").trigger("reset");
  });
});
