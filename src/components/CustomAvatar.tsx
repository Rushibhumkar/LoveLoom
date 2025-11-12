import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface CustomAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: number;
}

const colors = [
  { bg: '#FFB6B6', text: '#A30000' },
  { bg: '#FFD6A5', text: '#9C4E00' },
  { bg: '#FFF3B0', text: '#7A5C00' },
  { bg: '#CAFFBF', text: '#005A23' },
  { bg: '#9BF6FF', text: '#004E64' },
  { bg: '#A0C4FF', text: '#002B7F' },
  { bg: '#BDB2FF', text: '#3D0099' },
  { bg: '#FFC6FF', text: '#800080' },
  { bg: '#FFFFFC', text: '#333' },
];

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  imageUrl,
  name,
  size = 60,
}) => {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  const { bg, text } = colors[colorIndex];

  return (
    <View
      style={[
        styles.circle,
        {
          backgroundColor: bg,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.letter, { color: text, fontSize: size / 2 }]}>
        {firstLetter}
      </Text>
    </View>
  );
};

export default CustomAvatar;

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '700',
  },
});
