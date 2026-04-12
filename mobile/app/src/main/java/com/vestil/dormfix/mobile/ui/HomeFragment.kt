package com.vestil.dormfix.mobile.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.vestil.dormfix.mobile.AuthViewModel
import com.vestil.dormfix.mobile.R
import com.vestil.dormfix.mobile.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.uiState.observe(viewLifecycleOwner) { s ->
            val user = s.user
            if (user == null) {
                findNavController().navigate(R.id.action_home_to_login)
                return@observe
            }
            val display = listOfNotNull(user.firstName, user.lastName)
                .joinToString(" ")
                .ifBlank { user.email.orEmpty() }
            binding.textDisplayName.text = display
            binding.textEmail.text = user.email.orEmpty()
            binding.textRole.text = getString(R.string.role_label, user.role ?: "—")
        }

        binding.buttonLogout.setOnClickListener {
            viewModel.logout()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
