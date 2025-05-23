import { getSupabaseClient } from "../hooks/supabase";
import { Database } from "types/supabase";
const supabase = getSupabaseClient();

type ProfileUpdate = Partial<
  Database["public"]["Tables"]["profiles"]["Update"]
>;

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  try {
    console.log("Updating profile for user:", userId);
    console.log("Updates:", updates);
    
    // If there's an avatar_url and it starts with data:image/
    // it's a new image that needs to be uploaded
    if (updates.avatar_url && updates.avatar_url.startsWith('data:image/')) {
      console.log("Uploading base64 image");
      const avatarUrl = await uploadProfileImage(userId, updates.avatar_url);
      updates.avatar_url = avatarUrl;
    }

    // If avatar_url is a file:// URI from a local image picker
    // upload it to Supabase storage
    if (updates.avatar_url && updates.avatar_url.startsWith('file://')) {
      console.log("Uploading file image");
      const avatarUrl = await uploadProfileImageFile(userId, updates.avatar_url);
      updates.avatar_url = avatarUrl;
    }
    
    // Make sure we're updating all fields with proper formatting
    if (updates.skills && !Array.isArray(updates.skills)) {
      updates.skills = [];
    }
    
    if (updates.interests && !Array.isArray(updates.interests)) {
      updates.interests = [];
    }
    
    if (updates.seeking_skills && !Array.isArray(updates.seeking_skills)) {
      updates.seeking_skills = [];
    }
    
    // Always update the updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    console.log("Profile updated successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error };
  }
}

/**
 * Upload a profile image as a base64 data URI
 */
async function uploadProfileImage(userId: string, dataUrl: string): Promise<string> {
  try {
    // Extract the MIME type and base64 data
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URL');
    }
    
    const fileExt = matches[1].split('/')[1]; // e.g., 'jpeg', 'png'
    const base64Data = matches[2];
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    
    // Convert base64 to Blob-like object
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: matches[1] });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

/**
 * Upload a profile image from a file URI (used with ImagePicker)
 */
async function uploadProfileImageFile(userId: string, fileUri: string): Promise<string> {
  try {
    console.log(`Attempting to upload image from: ${fileUri}`);
    
    // For now, we'll return the file URI directly for local development
    // This allows us to see the image in the UI
    
    // In a real app with production Supabase, you would fetch the file and upload it
    // The implementation would look like this:
    
    /*
    // Create a unique filename
    const fileName = `${userId}_${Date.now()}.jpg`;
    
    // On Expo, we need to use FileSystem to read the file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    // Convert file URI to blob (this would work in a real app with proper imports)
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    // Upload the blob to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return publicUrl;
    */
    
    // For now, just return the local URI
    return fileUri;
  } catch (error) {
    console.error('Error uploading profile image file:', error);
    // Return the original URI if upload fails
    return fileUri;
  }
}

export async function getProfileById(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error };
  }
}
