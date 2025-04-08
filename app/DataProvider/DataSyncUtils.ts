import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './DataSyncConstants';
import { fetchAndSaveEvents } from './DataSyncEvents';

/**
 * Generate a random integer between min and max (inclusive)
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Check if this is the first time the app is launched
 */
export const checkFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    return value === null; // If null, it's the first launch
  } catch (error) {
    console.error('Error checking first launch:', error);
    return false;
  }
};

/**
 * Set the first launch flag to false
 */
export const setFirstLaunchComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
  } catch (error) {
    console.error('Error setting first launch complete:', error);
  }
};

/**
 * Generate and save random time values for scheduled updates
 */
export const setupRandomTimeValues = async (): Promise<{ hour: number, minutes: number }> => {
  try {
    const hour = getRandomInt(3, 4);
    const minutes = getRandomInt(1, 59);
    
    await AsyncStorage.setItem(STORAGE_KEYS.GROUP_TICKET_HOUR, hour.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.GROUP_TICKET_MINUTES, minutes.toString());
    
    console.log(`Random update time set to 0${hour}:${minutes}`);
    return { hour, minutes };
  } catch (error) {
    console.error('Error setting up random time values:', error);
    // Default values if there's an error
    return { hour: 2, minutes: 30 };
  }
};

/**
 * Get the stored time values for scheduled updates
 */
export const getScheduledUpdateTime = async (): Promise<{ hour: number, minutes: number }> => {
  try {
    const hour = await AsyncStorage.getItem(STORAGE_KEYS.GROUP_TICKET_HOUR);
    const minutes = await AsyncStorage.getItem(STORAGE_KEYS.GROUP_TICKET_MINUTES);
    
    if (hour !== null && minutes !== null) {
      return { 
        hour: parseInt(hour, 10), 
        minutes: parseInt(minutes, 10) 
      };
    } else {
      // If the values aren't set yet, set them up
      return await setupRandomTimeValues();
    }
  } catch (error) {
    console.error('Error getting scheduled update time:', error);
    // Default values if there's an error
    return { hour: 2, minutes: 30 };
  }
};

/**
 * Check sync times and determine if sync is needed
 */
export const checkSyncTimes = async (
  lastSuccessfulSyncDate: Date | null,
  lastSyncDateStr: string | null,
  hour: number,
  minutes: number,
  nowDate: Date,
  currentHour: number,
  currentMinutes: number
): Promise<void> => {
  if (lastSuccessfulSyncDate) {
    // Get just the date part (year, month, day)
    const lastSuccessfulSyncDay = new Date(
      lastSuccessfulSyncDate.getFullYear(), 
      lastSuccessfulSyncDate.getMonth(), 
      lastSuccessfulSyncDate.getDate()
    );
    
    // Calculate the expected next sync day (adding 1 day to last successful sync)
    const expectedNextSyncDay = new Date(lastSuccessfulSyncDay);
    expectedNextSyncDay.setDate(expectedNextSyncDay.getDate() + 1);
    
    // If current date is after the expected next sync day, we missed at least one sync
    if (nowDate > expectedNextSyncDay) {
      console.log('Missed scheduled sync due to device being off, syncing now');
      await fetchAndSaveEvents();
      return;
    }
    
    // If it's the same day as expected next sync but after scheduled time
    if (nowDate.getTime() === expectedNextSyncDay.getTime() && 
        (currentHour > hour || (currentHour === hour && currentMinutes > minutes))) {
      console.log('On sync day and scheduled time has passed, syncing now');
      await fetchAndSaveEvents();
      return;
    }
  }
  
  // Standard check if we missed the sync time today
  if (lastSyncDateStr) {
    const lastSyncDate = new Date(lastSyncDateStr);
    const lastSyncDay = new Date(
      lastSyncDate.getFullYear(), 
      lastSyncDate.getMonth(), 
      lastSyncDate.getDate()
    );
    
    // If the last sync was before today and the scheduled time has already passed today, sync now
    if (lastSyncDay < nowDate && 
        (currentHour > hour || (currentHour === hour && currentMinutes > minutes))) {
      console.log('Missed scheduled sync for today, doing it now');
      await fetchAndSaveEvents();
    }
  }
};