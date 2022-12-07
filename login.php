<?php
/*
Author: Javed Ur Rehman
Website: http://www.allphptricks.com/
*/
?>
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<title>Rafik.Ru</title>
	<link rel="stylesheet" href="./css/auth.css">
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
	<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.2.0/css/all.css'>
<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.2.0/css/fontawesome.css'>
	
	
</head>

<body>
	<?php
	require_once('db.php');
	require_once('loadphoto.php');
	session_start();
	// If form submitted, insert values into the database.
	if (isset($_POST['username'])) {

		$username = stripslashes($_REQUEST['username']); // removes backslashes
		$username = mysqli_real_escape_string($con, $username); //escapes special characters in a string
		$password = stripslashes($_REQUEST['password']);
		$password = mysqli_real_escape_string($con, $password);
	    
		//Checking is user existing in the database or not
		$query = "SELECT * FROM `users` WHERE username='$username' and password='" . md5($password) . "'";
		$result = mysqli_query($con, $query) or die(mysql_error());
		$rows = mysqli_num_rows($result);
	while($img = mysqli_fetch_assoc($result)){
		$_SESSION['id'] = $img['id'];
		$_SESSION['img'] = $img['img'];
	
}

		if ($rows == 1) {
			$_SESSION['username'] = $username;
			
			header("Location: /"); // Redirect user to index.php
		} else {
			header("Refresh: 1; url=/login");
				
				$erorrtext = "Username/password is incorrect.";
				$_SESSION['erorrr'] = $erorrtext;
		}
	} else {
	?>


 <!-- partial:index.partial.html -->
<button class="block" name="theme"></button>
<script src="./js/infinity.js"></script>
<div class="container">
	<div class="screen">
		<div class="screen__content">
			
			
			<form class="login" method="post" action="/core/login.php">
				<div class="login__field">
					<i class="login__icon fas fa-user"></i>
					<input type="text" name="username" class="login__input" placeholder="User name / Email">
				</div>
				<div class="login__field">
					<i class="login__icon fas fa-lock"></i>
					<input type="password" name="password" class="login__input" placeholder="Password">
				</div>
				<input class="button login__submit" type="submit" value="Log In Now" name="submit">
				</form>
			<div class="social-login">
				<h3>log in via</h3>
				<div class="social-icons">
					<a href="#" class="social-login__icon fab fa-instagram"></a>
					<a href="#" class="social-login__icon fab fa-facebook"></a>
					<a href="#" class="social-login__icon fab fa-twitter"></a>
				</div>
			</div>
		</div>
		<div class="reg"><a href="#" class="reg-link" onclick="document.getElementById('id01').style.display='block'" >Not account? Register now.</a></div>
		<div class="screen__background">
			<span class="screen__background__shape screen__background__shape4"></span>
			<span class="screen__background__shape screen__background__shape3"></span>		
			<span class="screen__background__shape screen__background__shape2"></span>
			<span class="screen__background__shape screen__background__shape1"></span>
		</div>
				
	</div>
</div>
<!-- partial -->
<div id="id01" class="modal">
<span onclick="document.getElementById('id01').style.display='none'" class="close" title="Close Modal">×</span>
<div class="container">
	<div class="screenq" id="rewq">
		<div class="screen__content" >
			
			
			<form class="register" method = "POST" action="/core/reg.php">
			<div class="register__field">
					<i class="register__icon fas fa-user"></i>
					<input type="text" name="username" class="register__input" placeholder="User name / Email">
				</div>
				<div class="register__field">
					<i class="register__icon fas fa-lock"></i>
					<input type="password" name="password" class="register__input" placeholder="Password">
				</div>
				<input class="button register__submit" type="submit" value="Register In Now" name="submit">
					</form>
			<div class="social-login">
				<h3>log in via</h3>
				<div class="social-icons">
					<a href="#" class="social-login__icon fab fa-instagram"></a>
					<a href="#" class="social-login__icon fab fa-facebook"></a>
					<a href="#" class="social-login__icon fab fa-twitter"></a>
				</div>
			</div>
		</div>
        
				<div class="screen__background">
			<span class="screen__background__shape screen__background__shape4q"></span>
			<span class="screen__background__shape screen__background__shape3q"></span>		
			<span class="screen__background__shape screen__background__shape2q"></span>
			<span class="screen__background__shape screen__background__shape1q"></span>
		</div>
				
	</div>
</div>
<!-- partial -->


</div>
<script>
// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
</script>

<?php } ?>
</body>

</html>