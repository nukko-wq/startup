# Space切り替え時のSection/Resource表示パフォーマンス分析

## 現在の実装分析

### データフェッチパターン
現在のアプリケーションは**すべてのデータを初期読み込み時に取得する設計**になっています：

#### WorkspaceInitializer.tsx:29-65
```typescript
useEffect(() => {
  // 全データを一度に初期化
  const allSpaces = initialWorkspaces.flatMap(...)
  const allSections = initialWorkspaces.flatMap(...)
  const allResources = initialWorkspaces.flatMap(...)
  
  dispatch(setSpaces(allSpaces))
  dispatch(setSections(allSections))
  dispatch(setResources(allResources))
}, [dispatch, initialWorkspaces, activeSpaceId])
```

### セレクターによるフィルタリング
Space切り替え時は、Redux内の全データから必要なデータをフィルタリング：

#### selectSectionsByActiveSpace (section/selector.ts:11-23)
```typescript
const selectSectionsByActiveSpace = createSelector(
  [selectSections, selectActiveSpaceId],
  (sections, activeSpaceId) => {
    const filteredSections = sections.filter(
      (section) => section.spaceId === activeSpaceId,
    )
    return {
      sections: filteredSections.sort((a, b) => a.order - b.order),
      isLoaded: filteredSections.length > 0,
    }
  },
)
```

## 特定されたパフォーマンス問題

### 1. 🟡 中程度: セレクターの不要なソート処理
**場所**: `selectSortedResourcesBySectionId` (resource/selector.ts:46-51)

```typescript
export const selectSortedResourcesBySectionId = createSelector(
  [selectResourcesBySectionId],
  (resources) => {
    return [...resources].sort((a, b) => a.order - b.order) // 毎回新しい配列とソート
  },
)
```

**問題**: 
- セクションごとのリソース表示で毎回ソート処理が発生
- 新しい配列を毎回作成してメモ化の効果を減少

### 2. 🟡 中程度: 大量データ時のフィルタリングコスト
**現在の状況**: すべてのSection/Resourceが一つのRedux storeに格納

**潜在的問題**:
- 多数のSpace/Section/Resourceがある場合、フィルタリング処理がO(n)で実行
- Spaceが増えるほど、無関係なデータのフィルタリングコストが増加

### 3. 🟢 軽微: セレクターのメモ化最適化不足
**場所**: `selectSectionsByActiveSpace`

**改善点**: ソート済みかのチェックが不足（spaceセレクターと同様の最適化が可能）

## 推奨される最適化

### 1. セレクターのソート最適化
```typescript
// 改善案: selectSortedResourcesBySectionId
export const selectSortedResourcesBySectionId = createSelector(
  [selectResourcesBySectionId],
  (resources) => {
    // 既にソート済みかチェック
    const needsSort = resources.some((resource, index) => 
      index > 0 && resource.order < resources[index - 1].order
    )
    
    return needsSort 
      ? [...resources].sort((a, b) => a.order - b.order)
      : resources
  },
)
```

### 2. 正規化されたRedux構造の検討（長期的改善）
現在のフラット構造ではなく、SpaceIDをキーとしたネストした構造：

```typescript
// 現在の構造
{
  sections: Section[],
  resources: Resource[]
}

// 改善案
{
  sectionsBySpaceId: {
    [spaceId]: Section[]
  },
  resourcesBySectionId: {
    [sectionId]: Resource[]
  }
}
```

### 3. 仮想化の検討（大量データ対応）
Resource数が多い場合の仮想化ライブラリ導入：
- `react-window` または `react-virtualized`
- 100件以上のResourceがある場合に効果的

## パフォーマンス測定指標

### 現在の推定パフォーマンス
- **Sectionフィルタリング**: O(n) - 全Section数に比例
- **Resourceフィルタリング**: O(m) - 全Resource数に比例
- **ソート処理**: O(k log k) - 各セクションのResource数に比例

### 典型的なデータ量での影響
- **小規模** (5 Spaces, 50 Sections, 500 Resources): 影響なし
- **中規模** (20 Spaces, 200 Sections, 2000 Resources): わずかな遅延
- **大規模** (50+ Spaces, 500+ Sections, 5000+ Resources): 顕著な遅延の可能性

## 実装優先度

### 1. 高優先度: セレクターソート最適化
- **実装コスト**: 低
- **効果**: 中
- **リスク**: なし

### 2. 中優先度: 正規化されたRedux構造
- **実装コスト**: 高
- **効果**: 高（大量データ時）
- **リスク**: 既存コードへの影響大

### 3. 低優先度: 仮想化導入
- **実装コスト**: 中
- **効果**: 高（UI描画時）
- **リスク**: 中（UX変更）

## 結論

**現在の実装は小〜中規模のデータ量では十分なパフォーマンス**を提供しています。

**即座に実装すべき改善**:
1. セレクターのソート最適化（spaceセレクターと同様の改善）

**将来的な検討事項**:
1. ユーザー数とデータ量の増加を監視
2. 大量データ時のRedux構造見直し
3. 必要に応じた仮想化導入

現在のSpace切り替えパフォーマンス改善（Redux状態更新の最適化）により、**Section/Resource表示の速度は既に大幅に向上している**と考えられます。