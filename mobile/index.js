/**
 * @format
 */

// Must be the first import — react-native-gesture-handler (a peer dep of
// React Navigation) requires this to run before anything else touches
// native modules.
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
