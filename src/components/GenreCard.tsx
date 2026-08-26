import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, BorderRadius, Spacing, Shadow} from '../theme';
import {Genre} from '../data/genres';

interface GenreCardProps {
  genre: Genre;
  onPress: (genre: Genre) => void;
  selected?: boolean;
}

const GenreCard: React.FC<GenreCardProps> = ({genre, onPress, selected = false}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {borderColor: genre.color},
        selected && {backgroundColor: genre.color + '25'},
      ]}
      onPress={() => onPress(genre)}
      activeOpacity={0.8}>
      <View style={[styles.iconContainer, {backgroundColor: genre.color + '20'}]}>
        <Icon name={genre.icon} size={22} color={genre.color} />
      </View>
      <Text style={[styles.name, selected && {color: genre.color}]}>{genre.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginRight: Spacing.sm,
    borderWidth: 1,
    minWidth: 85,
    ...Shadow.sm,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export default GenreCard;
