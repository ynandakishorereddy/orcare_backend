package com.orcare.client.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.orcare.client.databinding.ActivitySignUpBinding
import com.orcare.client.models.RegisterRequest
import com.orcare.client.network.RetrofitClient
import kotlinx.coroutines.launch

class SignUpActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignUpBinding
    private val api by lazy { RetrofitClient.create() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignUpBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSignUp.setOnClickListener {
            val name = binding.etFullName.text.toString().trim()
            val age = binding.etAge.text.toString().trim().toIntOrNull()
            val gender = when {
                binding.radioMale.isChecked -> "Male"
                binding.radioFemale.isChecked -> "Female"
                binding.radioOther.isChecked -> "Other"
                else -> null
            }
            val phone = binding.etPhone.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            val confirm = binding.etConfirmPassword.text.toString()

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Name, email and password required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (password != confirm) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    binding.progressBar.visibility = View.VISIBLE
                    val req = RegisterRequest(name, age, gender, phone, email, password)
                    val resp = api.register(req)
                    binding.progressBar.visibility = View.GONE
                    if (resp.isSuccessful) {
                        Toast.makeText(this@SignUpActivity, "Signup successful. Check email for OTP.", Toast.LENGTH_LONG).show()
                        startActivity(Intent(this@SignUpActivity, SignInActivity::class.java))
                    } else {
                        val err = resp.errorBody()?.string()
                        Toast.makeText(this@SignUpActivity, "Signup failed: $err", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this@SignUpActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
