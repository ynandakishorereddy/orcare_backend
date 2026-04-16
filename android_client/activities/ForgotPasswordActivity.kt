package com.orcare.client.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.orcare.client.databinding.ActivityForgotPasswordBinding
import com.orcare.client.network.RetrofitClient
import kotlinx.coroutines.launch

class ForgotPasswordActivity : AppCompatActivity() {
    private lateinit var binding: ActivityForgotPasswordBinding
    private val api by lazy { RetrofitClient.create() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityForgotPasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSendOtp.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            if (email.isEmpty()) {
                Toast.makeText(this, "Enter your email", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    binding.progressBar.visibility = View.VISIBLE
                    val resp = api.forgotPassword(mapOf("email" to email))
                    binding.progressBar.visibility = View.GONE
                    if (resp.isSuccessful) {
                        Toast.makeText(this@ForgotPasswordActivity, "OTP sent to email", Toast.LENGTH_SHORT).show()
                        val i = Intent(this@ForgotPasswordActivity, OtpVerifyActivity::class.java)
                        i.putExtra("email", email)
                        startActivity(i)
                    } else {
                        val err = resp.errorBody()?.string()
                        Toast.makeText(this@ForgotPasswordActivity, "Failed: $err", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this@ForgotPasswordActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
