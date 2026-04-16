package com.orcare.client.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.orcare.client.databinding.ActivitySignInBinding
import com.orcare.client.models.LoginRequest
import com.orcare.client.network.RetrofitClient
import kotlinx.coroutines.launch

class SignInActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignInBinding
    private val api by lazy { RetrofitClient.create() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignInBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }

        binding.btnSignIn.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Enter email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    binding.progressBar.visibility = View.VISIBLE
                    val resp = api.login(LoginRequest(email, password))
                    binding.progressBar.visibility = View.GONE
                    if (resp.isSuccessful) {
                        val body = resp.body()!!
                        getSharedPreferences("orcare_prefs", MODE_PRIVATE)
                            .edit().putString("token", body.token).putString("userName", body.name).apply()
                        Toast.makeText(this@SignInActivity, "Welcome ${body.name}", Toast.LENGTH_SHORT).show()
                        // TODO: start main activity
                    } else {
                        val err = resp.errorBody()?.string()
                        Toast.makeText(this@SignInActivity, "Login failed: $err", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this@SignInActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }

        binding.tvSignUp.setOnClickListener {
            // navigate to SignUp
            startActivity(Intent(this, SignUpActivity::class.java))
        }
    }
}
