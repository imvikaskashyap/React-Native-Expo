import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text, RefreshControl } from "react-native";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppWrite from "../../lib/useAppWrite";
import { getCurrentUser, getLatestVideos, getUserVideos, signOut } from "../../lib/appWrite";
import EmptyState from "../../components/EmptyState";
import InfoBox from "../../components/InfoBox";
import VideoCard from "../../components/VideoCard";
import { useState } from "react";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts, refetch: refetchUserVideos } = useAppWrite(() => getUserVideos(user.$id));
  const { data: latestVideos, refetch: refetchLatestVideos } = useAppWrite(getLatestVideos);

  const [refreshing, setRefreshing] = useState(false);

  console.log(posts);

  const onRefresh = async () => {
    setRefreshing(true);

    // Re-fetch both user videos and latest videos
    await Promise.all([refetchUserVideos(), refetchLatestVideos()]);

    setRefreshing(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
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
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
            </View>
            <View>
              <Text className="mt-10 font-medium text-3xl text-orange-400">Your Posts</Text>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;
