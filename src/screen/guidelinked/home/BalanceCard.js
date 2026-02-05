import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../../util/Theme';
import Api from '../../../service/Api';
import {API_STRIPE_LOGIN_LINK} from '../../../service/apiEndPoint';
import Loader from '../../../util/Loader';
import {useState} from 'react';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import HelpVideoIcon from '../HelpVideoIcon';

const BalanceCard = ({availableBalance, pendingBalance}) => {
  const [loaderVisible, setLoaderVisible] = useState(false);

  const getLoginLink = async () => {
    setLoaderVisible(true);

    // static 1 is the page number
    const response = await Api.get(`${API_STRIPE_LOGIN_LINK}`);

    if (response.status == 'RC200') {
      let data = response.data.url;

      try {
        // Check if the InAppBrowser is available
        const isAvailable = await InAppBrowser.isAvailable();
        if (isAvailable) {
          // Open the URL
          await InAppBrowser.open(data, {
            // Optional settings
            // You can customize the in-app browser's appearance and behavior here
            dismissButtonStyle: 'close',
            preferredBarTintColor: '#6200EE',
            preferredControlTintColor: 'white',
            showTitle: true,
            // Other settings can be added as per your needs
          });
        }
      } catch (error) {
        Linking.openURL(data);
      }
    }

    setLoaderVisible(false);
  };

  return (
    <View style={{alignItems: 'center'}}>
      <View style={styles.card}>
        <Text style={styles.title}>Account Balance</Text>

        <View style={styles.balanceRow}>
          <Text style={styles.label}>Available:</Text>
          <Text style={styles.value}>${availableBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.label}>Pending:</Text>
          <Text style={styles.value}>${pendingBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.label}>Total Balance:</Text>
          <Text style={styles.value}>
            ${(availableBalance + pendingBalance).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            getLoginLink();
          }}>
          <Text style={styles.buttonText}>Manage Stripe Account</Text>
        </TouchableOpacity>

        {/* <HelpVideoIcon style={{marginTop:20, alignSelf: 'center'}} title="Help Video" type={5} /> */}
      </View>

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </View>
  );
};

export default BalanceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
