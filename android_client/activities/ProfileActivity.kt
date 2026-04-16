package com.orcare.client.activities

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.orcare.client.databinding.ActivityProfileBinding
import com.orcare.client.network.RetrofitClient
import kotlinx.coroutines.launch

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding
    private val prefs by lazy { getSharedPreferences("orcare_prefs", MODE_PRIVATE) }
    private val tokenProvider = { prefs.getString("token", null) }
    private val api by lazy { RetrofitClient.create(tokenProvider) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadProfile()

        binding.btnUpdate.setOnClickListener {
            val name = binding.etName.text.toString().trim()
            val phone = binding.etPhone.text.toString().trim()
            val age = binding.etAge.text.toString().trim().toIntOrNull()
            val gender = binding.etGender.text.toString().trim()

            lifecycleScope.launch {
                try {
                    binding.progressBar.visibility = View.VISIBLE
                    val body = mutableMapOf<String, Any>()
                    body["name"] = name
                    body["phone"] = phone
                    age?.let { body["age"] = it }
                    body["gender"] = gender

                    val state = binding.etState.text.toString().trim()
                    if (state.isNotEmpty()) body["state"] = state

                    val district = binding.etDistrict.text.toString().trim()
                    if (district.isNotEmpty()) body["district"] = district

                    val image = binding.etImage.text.toString().trim()
                    if (image.isNotEmpty()) body["profileImage"] = image

                    val resp = api.updateProfile(body)
                    binding.progressBar.visibility = View.GONE
                    if (resp.isSuccessful) {
                        Toast.makeText(this@ProfileActivity, "Profile updated", Toast.LENGTH_SHORT).show()
                    } else {
                        val err = resp.errorBody()?.string()
                        Toast.makeText(this@ProfileActivity, "Failed: $err", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this@ProfileActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun loadProfile() {
        lifecycleScope.launch {
            try {
                binding.progressBar.visibility = View.VISIBLE
                val resp = api.getProfile()
                binding.progressBar.visibility = View.GONE
                if (resp.isSuccessful) {
                    val user = resp.body()!!
                    binding.etName.setText(user.name)
                    binding.etPhone.setText(user.phone)
                    binding.etAge.setText(user.age?.toString() ?: "")
                    binding.etGender.setText(user.gender ?: "")
                    binding.etState.setText(user.state ?: "")
                    binding.etDistrict.setText(user.district ?: "")
                    binding.etImage.setText(user.profileImage ?: "")
                } else {
                    val err = resp.errorBody()?.string()
                    Toast.makeText(this@ProfileActivity, "Failed: $err", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                binding.progressBar.visibility = View.GONE
                Toast.makeText(this@ProfileActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
