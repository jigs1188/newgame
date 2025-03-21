import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A9B5DF', // Sets the background color to white
    justifyContent: 'center',
    alignItems: 'center',
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
    


  }
});
