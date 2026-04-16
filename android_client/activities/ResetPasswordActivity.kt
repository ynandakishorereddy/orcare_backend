package com.orcare.client.activities

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.orcare.client.databinding.ActivityResetPasswordBinding
import com.orcare.client.network.RetrofitClient
import kotlinx.coroutines.launch

class ResetPasswordActivity : AppCompatActivity() {
    private lateinit var binding: ActivityResetPasswordBinding
    private val api by lazy { RetrofitClient.create() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityResetPasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val email = intent.getStringExtra("email") ?: ""
        val otp = intent.getStringExtra("otp") ?: ""

        binding.btnReset.setOnClickListener {
            val newPass = binding.etNewPassword.text.toString()
            val confirm = binding.etConfirmPassword.text.toString()
            if (newPass.isEmpty() || newPass != confirm) {
                Toast.makeText(this, "Passwords must match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    binding.progressBar.visibility = View.VISIBLE
                    val resp = api.resetPassword(mapOf("email" to email, "otp" to otp, "newPassword" to newPass))
                    binding.progressBar.visibility = View.GONE
                    if (resp.isSuccessful) {
                        Toast.makeText(this@ResetPasswordActivity, "Password reset successful", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        val err = resp.errorBody()?.string()
                        Toast.makeText(this@ResetPasswordActivity, "Failed: $err", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this@ResetPasswordActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
