// @flow

import * as React from 'react';
import { Button, Component, Text, View } from 'reactxp';
import * as Cell from './Cell';
import { Layout, Container } from './Layout';
import {
  NavigationBar,
  NavigationContainer,
  NavigationScrollbars,
  BackBarItem,
  TitleBarItem,
} from './NavigationBar';
import SettingsHeader, { HeaderTitle } from './SettingsHeader';
import Switch from './Switch';
import styles from './AdvancedSettingsStyles';
import Img from './Img';

const MIN_MSSFIX_VALUE = 1000;
const MAX_MSSFIX_VALUE = 1500;

type Props = {
  enableIpv6: boolean,
  protocol: string,
  mssfix: ?number,
  port: string | number,
  setEnableIpv6: (boolean) => void,
  setOpenVpnMssfix: (?number) => void,
  onUpdate: (protocol: string, port: string | number) => void,
  onClose: () => void,
};

type State = {
  persistedMssfix: ?number,
  editedMssfix: ?number,
  focusOnMssfix: boolean,
};

export class AdvancedSettings extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      persistedMssfix: props.mssfix,
      editedMssfix: props.mssfix,
      focusOnMssfix: false,
    };
  }

  componentDidUpdate(_oldProps: Props, _oldState: State) {
    if (this.props.mssfix !== this.state.persistedMssfix) {
      this.setState((state, props) => ({
        ...state,
        persistedMssfix: props.mssfix,
        editedMssfix: state.focusOnMssfix ? state.editedMssfix : props.mssfix,
      }));
    }
  }

  render() {
    let portSelector = null;
    let protocol = this.props.protocol.toUpperCase();

    if (protocol === 'AUTOMATIC') {
      protocol = 'Automatic';
    } else {
      portSelector = this._createPortSelector();
    }

    let mssfixStyle;
    if (this._mssfixIsValid()) {
      mssfixStyle = styles.advanced_settings__mssfix_valid_value;
    } else {
      mssfixStyle = styles.advanced_settings__mssfix_invalid_value;
    }

    return (
      <Layout>
        <Container>
          <View style={styles.advanced_settings}>
            <NavigationContainer>
              <NavigationBar>
                <BackBarItem action={this.props.onClose} title={'Settings'} />
                <TitleBarItem>Advanced</TitleBarItem>
              </NavigationBar>

              <View style={styles.advanced_settings__container}>
                <NavigationScrollbars style={styles.advanced_settings__scrollview}>
                  <SettingsHeader>
                    <HeaderTitle>Advanced</HeaderTitle>
                  </SettingsHeader>

                  <Cell.Container>
                    <Cell.Label>Enable IPv6</Cell.Label>
                    <Switch isOn={this.props.enableIpv6} onChange={this.props.setEnableIpv6} />
                  </Cell.Container>
                  <Cell.Footer>Enable IPv6 communication through the tunnel.</Cell.Footer>

                  <View style={styles.advanced_settings__content}>
                    <Selector
                      title={'Network protocols'}
                      values={['Automatic', 'UDP', 'TCP']}
                      value={protocol}
                      onSelect={(protocol) => {
                        this.props.onUpdate(protocol, 'Automatic');
                      }}
                    />

                    <View style={styles.advanced_settings__cell_spacer} />

                    {portSelector}
                  </View>
                </NavigationScrollbars>

                <Cell.Container>
                  <Cell.Label>Mssfix</Cell.Label>
                  <Cell.Input
                    keyboardType={'numeric'}
                    maxLength={5}
                    placeholder={'None'}
                    value={this.state.editedMssfix}
                    style={mssfixStyle}
                    onChangeText={this._onMssfixChange}
                    onFocus={this._onMssfixFocus}
                    onBlur={this._onMssfixBlur}
                  />
                </Cell.Container>
                <Cell.Footer>Change OpenVPN MSS value</Cell.Footer>
              </View>
            </NavigationContainer>
          </View>
        </Container>
      </Layout>
    );
  }

  _createPortSelector() {
    const protocol = this.props.protocol.toUpperCase();
    const ports =
      protocol === 'TCP'
        ? ['Automatic', 80, 443]
        : ['Automatic', 1194, 1195, 1196, 1197, 1300, 1301, 1302];

    return (
      <Selector
        title={protocol + ' port'}
        values={ports}
        value={this.props.port}
        onSelect={(port) => {
          this.props.onUpdate(protocol, port);
        }}
      />
    );
  }

  _onMssfixChange = (mssfixString: string) => {
    const mssfix = mssfixString.replace(/[^0-9]/g, '');

    if (mssfix === '') {
      this.setState({ editedMssfix: null });
    } else {
      this.setState({ editedMssfix: parseInt(mssfix, 10) });
    }
  };

  _onMssfixFocus = () => {
    this.setState({ focusOnMssfix: true });
  };

  _onMssfixBlur = () => {
    this.props.setOpenVpnMssfix(this.state.editedMssfix);
    this.setState((state, _props) => {
      return { focusOnMssfix: false, persistedMssfix: state.editedMssfix };
    });
  };

  _mssfixIsValid(): boolean {
    const mssfix = this.state.editedMssfix;

    return mssfix >= MIN_MSSFIX_VALUE && mssfix <= MAX_MSSFIX_VALUE;
  }
}

type SelectorProps<T> = {
  title: string,
  values: Array<T>,
  value: T,
  onSelect: (T) => void,
};

type SelectorState = {
  hoveredButtonIndex: number,
};

class Selector extends Component<SelectorProps<*>, SelectorState> {
  state = { hoveredButtonIndex: -1 };

  handleButtonHover = (value) => {
    this.setState({ hoveredButtonIndex: value });
  };

  render() {
    return (
      <View>
        <View style={styles.advanced_settings__section_title}>{this.props.title}</View>

        {this.props.values.map((value) => this._renderCell(value))}
      </View>
    );
  }

  _renderCell(value) {
    const selected = value === this.props.value;
    if (selected) {
      return this._renderSelectedCell(value);
    } else {
      return this._renderUnselectedCell(value);
    }
  }

  _renderSelectedCell(value) {
    return (
      <Button
        style={[
          styles.advanced_settings__cell,
          value === this.state.hoveredButtonIndex
            ? styles.advanced_settings__cell_selected_hover
            : null,
        ]}
        onPress={() => this.props.onSelect(value)}
        onHoverStart={() => this.handleButtonHover(value)}
        onHoverEnd={() => this.handleButtonHover(-1)}
        key={value}>
        <Img
          style={styles.advanced_settings__cell_icon}
          source="icon-tick"
          tintColor="currentColor"
        />
        <Text style={styles.advanced_settings__cell_label}>{value}</Text>
      </Button>
    );
  }

  _renderUnselectedCell(value) {
    return (
      <Button
        style={[
          styles.advanced_settings__cell_dimmed,
          value === this.state.hoveredButtonIndex ? styles.advanced_settings__cell_hover : null,
        ]}
        onPress={() => this.props.onSelect(value)}
        onHoverStart={() => this.handleButtonHover(value)}
        onHoverEnd={() => this.handleButtonHover(-1)}
        key={value}>
        <View style={styles.advanced_settings__cell_icon} />
        <Text style={styles.advanced_settings__cell_label}>{value}</Text>
      </Button>
    );
  }
}
