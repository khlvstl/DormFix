package com.vestil.dormfix.mobile.ui

import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.vestil.dormfix.mobile.AuthViewModel
import com.vestil.dormfix.mobile.R
import com.vestil.dormfix.mobile.databinding.FragmentRegisterBinding

class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.uiState.observe(viewLifecycleOwner) { s ->
            binding.progressRegister.visibility = if (s.loading) View.VISIBLE else View.GONE
            binding.buttonRegister.isEnabled = !s.loading
            binding.buttonGoLogin.isEnabled = !s.loading

            if (s.error != null) {
                binding.textRegisterMessage.text = s.error
                binding.textRegisterMessage.visibility = View.VISIBLE
            } else {
                binding.textRegisterMessage.visibility = View.GONE
            }

            if (s.user != null && findNavController().currentDestination?.id == R.id.register) {
                Toast.makeText(requireContext(), R.string.msg_register_success, Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_register_to_home)
            }
        }

        binding.buttonRegister.setOnClickListener {
            val name = binding.inputName.text?.toString().orEmpty()
            val email = binding.inputEmail.text?.toString()?.trim().orEmpty()
            val password = binding.inputPassword.text?.toString().orEmpty()

            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.textRegisterMessage.text = getString(R.string.err_email_required)
                binding.textRegisterMessage.visibility = View.VISIBLE
                return@setOnClickListener
            }
            if (password.length < 6) {
                binding.textRegisterMessage.text = getString(R.string.err_password_length)
                binding.textRegisterMessage.visibility = View.VISIBLE
                return@setOnClickListener
            }

            val parts = name.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
            val rest = parts.drop(1).joinToString(" ")
            if (parts.size < 2 || parts[0].length < 2 || rest.length < 2) {
                binding.textRegisterMessage.text = getString(R.string.err_name_required)
                binding.textRegisterMessage.visibility = View.VISIBLE
                return@setOnClickListener
            }

            binding.textRegisterMessage.visibility = View.GONE
            viewModel.registerWithFullName(name, email, password)
        }

        binding.buttonGoLogin.setOnClickListener {
            viewModel.clearError()
            findNavController().popBackStack()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
