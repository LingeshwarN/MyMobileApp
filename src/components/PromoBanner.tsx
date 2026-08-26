import React, {useRef, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {Colors, BorderRadius, Spacing, Typography} from '../theme';
import {Promotion, promotions} from '../data/promotions';

const {width} = Dimensions.get('window');
const BANNER_WIDTH = width - Spacing.base * 2;

const PromoBanner: React.FC = () => {
  const scrollRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % promotions.length;
      scrollRef.current?.scrollTo({x: nextIndex * BANNER_WIDTH, animated: true});
      setActiveIndex(nextIndex);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}>
        {promotions.map((promo: Promotion) => (
          <View
            key={promo.id}
            style={[styles.banner, {backgroundColor: promo.backgroundColor}]}>
            <Text style={[styles.title, {color: promo.color}]}>{promo.title}</Text>
            <Text style={[styles.subtitle, {color: promo.color + 'CC'}]}>
              {promo.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {promotions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  banner: {
    width: BANNER_WIDTH,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    justifyContent: 'center',
    minHeight: 120,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: Colors.textMuted,
  },
});

export default PromoBanner;
