import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
  editable?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 24,
  onRate,
  editable = false,
}) => {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const iconName = i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline';
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => editable && onRate && onRate(i)}
        disabled={!editable}
        activeOpacity={0.7}>
        <Icon name={iconName} size={size} color={Colors.accent} />
      </TouchableOpacity>,
    );
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

export default StarRating;
