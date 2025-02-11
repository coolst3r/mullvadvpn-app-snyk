package net.mullvad.mullvadvpn.ui.fragment

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.platform.ComposeView
import net.mullvad.mullvadvpn.R
import net.mullvad.mullvadvpn.compose.screen.ConnectScreen
import net.mullvad.mullvadvpn.lib.theme.AppTheme
import net.mullvad.mullvadvpn.ui.MainActivity
import net.mullvad.mullvadvpn.ui.NavigationBarPainter
import net.mullvad.mullvadvpn.util.appendHideNavOnPlayBuild
import net.mullvad.mullvadvpn.viewmodel.ConnectViewModel
import org.koin.androidx.viewmodel.ext.android.viewModel

class ConnectFragment : BaseFragment(), NavigationBarPainter {

    // Injected dependencies
    private val connectViewModel: ConnectViewModel by viewModel()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_compose, container, false)

        view.findViewById<ComposeView>(R.id.compose_view).setContent {
            AppTheme {
                val state = connectViewModel.uiState.collectAsState().value
                ConnectScreen(
                    uiState = state,
                    viewActions = connectViewModel.viewActions,
                    onDisconnectClick = connectViewModel::onDisconnectClick,
                    onReconnectClick = connectViewModel::onReconnectClick,
                    onConnectClick = connectViewModel::onConnectClick,
                    onCancelClick = connectViewModel::onCancelClick,
                    onSwitchLocationClick = ::openSwitchLocationScreen,
                    onToggleTunnelInfo = connectViewModel::toggleTunnelInfoExpansion,
                    onUpdateVersionClick = { openDownloadUrl() },
                    onManageAccountClick = connectViewModel::onManageAccountClick,
                    onOpenOutOfTimeScreen = ::openOutOfTimeScreen,
                    onSettingsClick = ::openSettingsView,
                    onAccountClick = ::openAccountView
                )
            }
        }

        return view
    }

    private fun openDownloadUrl() {
        val intent =
            Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse(
                        requireContext().getString(R.string.download_url).appendHideNavOnPlayBuild()
                    )
                )
                .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
        requireContext().startActivity(intent)
    }

    private fun openSwitchLocationScreen() {
        parentFragmentManager.beginTransaction().apply {
            setCustomAnimations(
                R.anim.fragment_enter_from_bottom,
                R.anim.do_nothing,
                R.anim.do_nothing,
                R.anim.fragment_exit_to_bottom
            )
            replace(R.id.main_fragment, SelectLocationFragment())
            addToBackStack(null)
            commitAllowingStateLoss()
        }
    }

    private fun openOutOfTimeScreen() {
        parentFragmentManager.beginTransaction().apply {
            replace(R.id.main_fragment, OutOfTimeFragment())
            commitAllowingStateLoss()
        }
    }

    private fun openSettingsView() {
        (context as? MainActivity)?.openSettings()
    }

    private fun openAccountView() {
        (context as? MainActivity)?.openAccount()
    }
}
