package com.example.orcare.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.orcare.network.GoogleLoginRequest
import com.example.orcare.network.RetrofitClient
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.launch

class GoogleSignInActivity : AppCompatActivity() {

    private lateinit var googleSignInClient: GoogleSignInClient
    private val RC_SIGN_IN = 9001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Setup ViewBinding here...
        // setContentView(R.layout.activity_google_sign_in)

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken("688644594315-440mq0nsruk81ip5l948248el7ae5gqd.apps.googleusercontent.com") // Ensure this matches the Backend Client ID
            .requestEmail()
            .build()

        googleSignInClient = GoogleSignIn.getClient(this, gso)

        // Find your button and set click listener
        // binding.btnGoogleSignIn.setOnClickListener { signIn() }
    }

    private fun signIn() {
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            handleSignInResult(task)
        }
    }

    private fun handleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        try {
            val account = completedTask.getResult(ApiException::class.java)
            val idToken = account?.idToken
            
            if (idToken != null) {
                sendTokenToBackend(idToken)
            } else {
                Toast.makeText(this, "Failed to get ID Token", Toast.LENGTH_SHORT).show()
            }
        } catch (e: ApiException) {
            Toast.makeText(this, "Google sign in failed: \${e.statusCode}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun sendTokenToBackend(idToken: String) {
        lifecycleScope.launch {
            try {
                val request = GoogleLoginRequest(idToken = idToken)
                val response = RetrofitClient.apiService.googleLogin(request)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val jwt = response.body()?.token
                    // TODO: Save JWT securely (e.g. EncryptedSharedPreferences)
                    Toast.makeText(this@GoogleSignInActivity, "Login Successful!", Toast.LENGTH_SHORT).show()
                    
                    // Navigate to Main Activity
                    // startActivity(Intent(this@GoogleSignInActivity, MainActivity::class.java))
                    // finish()
                } else {
                    Toast.makeText(this@GoogleSignInActivity, "Backend Auth Failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@GoogleSignInActivity, "Network Error: \${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
