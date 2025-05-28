import React, { useState } from 'react';
import { Modal, View, StyleSheet, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from './Themed';

interface DateTimePickerModalProps {
  value: Date;
  onChange: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({ 
  value, 
  onChange, 
  visible, 
  onClose 
}) => {
  const [tempDate, setTempDate] = useState<Date>(value);
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.8)' }]}>
        <View style={[styles.pickerContainer, { backgroundColor: theme === 'light' ? '#FFF' : '#121212' }]}>
          <DateTimePicker
            value={tempDate}
            mode="datetime"
            display="spinner"
            onChange={(_, date) => date && setTempDate(date)}
            themeVariant={theme}
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} />
            <Button 
              title="Apply" 
              onPress={() => {
                onChange(tempDate);
                onClose();
              }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});