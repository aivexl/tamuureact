import { CardComponent } from './Registry';
import { TextCard } from './TextCard';
import { ImageCard } from './ImageCard';
import { CountdownCard } from './CountdownCard';
import { MapsCard } from './MapsCard';
import { LiveStreamingCard } from './LiveStreamingCard';
import { SocialMockupCard } from './SocialMockupCard';
import { ProfileCard } from './ProfileCard';
import { QuoteCard } from './QuoteCard';
import { LoveStoryCard } from './LoveStoryCard';
import { DigitalGiftCard } from './DigitalGiftCard';
import { GiftAddressCard } from './GiftAddressCard';
import { ButtonCard } from './ButtonCard';
import { VideoCard } from './VideoCard';
import { PhotoGridCard } from './PhotoGridCard';

export const ElementRegistry: Record<string, CardComponent> = {
    text: TextCard,
    image: ImageCard,
    gif: ImageCard,
    profile_photo: ImageCard,
    countdown: CountdownCard,
    maps_point: MapsCard,
    live_streaming: LiveStreamingCard,
    social_mockup: SocialMockupCard,
    profile_card: ProfileCard,
    quote: QuoteCard,
    love_story: LoveStoryCard,
    digital_gift: DigitalGiftCard,
    gift_address: GiftAddressCard,
    button: ButtonCard,
    open_invitation_button: ButtonCard,
    video: VideoCard,
    photo_grid: PhotoGridCard,
    photo_frame: ImageCard
};

export { BaseCardWrapper } from './BaseCardWrapper';
export * from './Registry';
