package com.orcare.client.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.orcare.client.databinding.ActivityOtpVerifyBinding
import com.orcare.client.network.RetrofitClient
import kotlinx.coroutines.launch

class OtpVerifyActivity : AppCompatActivity() {
    private lateinit var binding: ActivityOtpVerifyBinding
    private val api by lazy { RetrofitClient.create() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOtpVerifyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val email = intent.getStringExtra("email") ?: ""

        binding.btnVerify.setOnClickListener {
            val otp = binding.etOtp.text.toString().trim()
            if (otp.isEmpty()) {
                Toast.makeText(this, "Enter OTP", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    binding.progressBar.visibility = View.VISIBLE
                    val resp = api.verifyOtp(mapOf("email" to email, "otp" to otp, "type" to "email"))
                    binding.progressBar.visibility = View.GONE
                    if (resp.isSuccessful) {
                        Toast.makeText(this@OtpVerifyActivity, "OTP verified", Toast.LENGTH_SHORT).show()
                        // If verification intended for password reset, navigate to Reset
                        val i = Intent(this@OtpVerifyActivity, ResetPasswordActivity::class.java)
                        i.putExtra("email", email)
                        i.putExtra("otp", otp)
                        startActivity(i)
                    } else {
                        val err = resp.errorBody()?.string()
                        Toast.makeText(this@OtpVerifyActivity, "Failed: $err", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this@OtpVerifyActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
