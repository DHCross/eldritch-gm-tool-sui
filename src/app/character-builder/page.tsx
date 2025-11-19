import ManualCharacterBuilder from '../../components/ManualCharacterBuilder';
import ContentBox from '@/components/ContentBox';

export default function CharacterBuilderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentBox>
        <ManualCharacterBuilder />
      </ContentBox>
    </div>
  );
}
