jQuery(document).ready(($) => {
  $("#registerForm").submit(async (e) => {
    e.preventDefault();

    const id = e.target.id.value;
    const password = e.target.password.value;
    const email = e.target.email.value;
    const name = e.target.name.value;

    
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password, email, name }),
    });

    const { success, error } = await response.json();

    if (success) {
      alert("Registration successful! Redirecting to login...");
      window.location.href = "index.html";  
    } else {
      alert(error || "Failed to register");
    }
  });
});
