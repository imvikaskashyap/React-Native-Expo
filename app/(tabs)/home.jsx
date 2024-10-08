import {
  View,
  Text,
  FlatList,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
// import SearchInput from "../../components/SearchInput";
import TrendingVideos from "../../components/TrendingVideos";
import EmptyState from "../../components/EmptyState";
import { getAllVideos, getLatestVideos } from "../../lib/appWrite";
import useAppWrite from "../../lib/useAppWrite";
import VideoCard from "../../components/VideoCard";
import SearchInput from "../../components/SearchInput";
import { useGlobalContext } from "../../context/GlobalProvider";

const Home = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: videos, refetch } = useAppWrite(getAllVideos);
  const { data: latestVideos, } = useAppWrite(getLatestVideos);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={videos}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          
          const latestVideo = latestVideos.find(video => video.$id === item.$id);
          const likeCounts = latestVideo ? latestVideo.likes.length : 0;

          const liked = user?.likedVideos?.some((likedVideo) => likedVideo.$id === item.$id);

          return (
            <VideoCard
              title={item.title}
              thumbnail={item.thumbnail}
              user={item.user}
              video={item.video}
              videoId={item.$id}
              likeCounts={likeCounts} 
              liked={liked} 
            />
          );
        }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-medium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl text-white font-psemibold">{user?.username}</Text>
              </View>
              <View>
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>
            <SearchInput />
            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-3">
                Latest Videos
              </Text>
              <TrendingVideos posts={videos ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos created yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
