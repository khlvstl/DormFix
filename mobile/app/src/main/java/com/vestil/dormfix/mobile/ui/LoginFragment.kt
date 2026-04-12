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
import com.vestil.dormfix.mobile.databinding.FragmentLoginBinding

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.uiState.observe(viewLifecycleOwner) { s ->
            binding.progressLogin.visibility = if (s.loading) View.VISIBLE else View.GONE
            binding.buttonLogin.isEnabled = !s.loading
            binding.buttonGoRegister.isEnabled = !s.loading

            if (s.error != null) {
                binding.textLoginMessage.text = s.error
                binding.textLoginMessage.visibility = View.VISIBLE
            } else {
                binding.textLoginMessage.visibility = View.GONE
            }

            if (s.user != null && findNavController().currentDestination?.id == R.id.login) {
                Toast.makeText(requireContext(), R.string.msg_login_success, Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_login_to_home)
            }
        }

        binding.buttonLogin.setOnClickListener {
            val email = binding.inputEmail.text?.toString()?.trim().orEmpty()
            val password = binding.inputPassword.text?.toString().orEmpty()

            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.textLoginMessage.text = getString(R.string.err_email_required)
                binding.textLoginMessage.visibility = View.VISIBLE
                return@setOnClickListener
            }
            if (password.isBlank()) {
                binding.textLoginMessage.text = getString(R.string.err_password_required)
                binding.textLoginMessage.visibility = View.VISIBLE
                return@setOnClickListener
            }

            binding.textLoginMessage.visibility = View.GONE
            viewModel.login(email, password)
        }

        binding.buttonGoRegister.setOnClickListener {
            viewModel.clearError()
            findNavController().navigate(R.id.action_login_to_register)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
