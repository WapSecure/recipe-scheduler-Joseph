import Constants from 'expo-constants';

export const getProjectId = () => {
  const projectId = Constants.expoConfig?.extra?.projectId;
  if (!projectId) {
    throw new Error('Project ID not found in app config');
  }
  return projectId;
};

console.log('Project ID:', getProjectId());