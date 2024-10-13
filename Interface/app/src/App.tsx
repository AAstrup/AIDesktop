
import React from 'react';
import './App.css';
import { Flex, Text, Button, Theme, ThemePanel } from "@radix-ui/themes";

function App() {
  return (
    <>
      <Theme>
        <Flex direction="column" gap="2">
          <Text>Hello from Radix Themes :)</Text>
          <Button>Let's go</Button>
        </Flex>
        <ThemePanel />
      </Theme>
    </>
  );
}

export default App;