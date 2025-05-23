import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A9B5DF', // Sets the background color to white
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 20,
  },
  // Other styles remain unchanged
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A9B5DF',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonSpacing: {
    marginVertical: 10,
  },
  teacherControls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 250,
  },
  inputBox: {
    borderWidth: 1,
    padding: 5,
    width: 80,
    marginBottom: 5,
  },
  gameMessage: {
    marginTop: 10,
  },
  buttonSpacing: {
    margin: 10,
  },
  gameControls: {
    marginVertical: 20,
  },
  homeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'lightgray',
  },
  button: {
    // Additional button styling
    backgroundColor: 'green',
    borderBlockColor:'yellow',



  },
  gameContainer:{
    
    position: 'fixed',
    bottom: 0,
    top: 0,
    backgroundColor: '#FFF2F2',
     marginBottom: 10,
     marginTop: 0,
     alignContent: 'center',
     alignItems: 'center',
    


  },// Add these to your existing styles
modeSwitcher: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 10,
  backgroundColor: '#f0f0f0',
  marginBottom: 10,
},
modeText: {
  fontSize: 16,
  fontWeight: 'bold',
},
});
