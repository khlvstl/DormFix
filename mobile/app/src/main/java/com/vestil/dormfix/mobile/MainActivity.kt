package com.vestil.dormfix.mobile

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.vestil.dormfix.mobile.ui.screens.HomeScreen
import com.vestil.dormfix.mobile.ui.screens.LoginScreen
import com.vestil.dormfix.mobile.ui.screens.RegisterScreen
import com.vestil.dormfix.mobile.ui.theme.DormFixMobileTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DormFixMobileTheme {
                val navController = rememberNavController()
                val vm: AuthViewModel = viewModel()
                val state = vm.state
                val context = LocalContext.current

                LaunchedEffect(state.error) {
                    val msg = state.error ?: return@LaunchedEffect
                    Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                    vm.clearError()
                }

                LaunchedEffect(state.user) {
                    if (state.user != null) {
                        navController.navigate("home") {
                            popUpTo("login") { inclusive = true }
                        }
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NavHost(navController = navController, startDestination = "login") {
                        composable("login") {
                            LoginScreen(
                                state = state,
                                onLogin = { email, password -> vm.login(email, password) },
                                onGoToRegister = {
                                    vm.clearError()
                                    navController.navigate("register")
                                }
                            )
                        }
                        composable("register") {
                            RegisterScreen(
                                state = state,
                                onRegister = { fn, ln, em, pw, role ->
                                    vm.register(fn, ln, em, pw, role)
                                },
                                onGoToLogin = {
                                    vm.clearError()
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("home") {
                            val user = state.user
                            if (user != null) {
                                HomeScreen(
                                    user = user,
                                    onLogout = {
                                        vm.logout()
                                        navController.navigate("login") {
                                            popUpTo(0) { inclusive = true }
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
