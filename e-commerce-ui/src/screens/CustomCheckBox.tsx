// CustomCheckBox.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
// import RememberCheckSvg from './path/to/RememberCheckSvg'; // Adjust the path to your SVG icon
import { Text } from 'react-native';
import { svg } from '../assets/svg'

interface CustomCheckBoxProps {
  value: boolean;
  onValueChange: () => void;
}

const CustomCheckBox: React.FC<CustomCheckBoxProps> = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity onPress={onValueChange} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, value && styles.checked]}>
        {value && <svg.RememberCheckSvg/>} {/* Render the SVG icon if checked */}
      </View>
      <Text style={styles.checkboxLabel}>Same as Billing Address</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#50858B', // Border color
    borderRadius: 4, // Rounded corners (optional)
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Background color when unchecked
  },
  checked: {
    backgroundColor: '#50858B', // Background color when checked
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default CustomCheckBox;