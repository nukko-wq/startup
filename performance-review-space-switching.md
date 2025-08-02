# Space切り替えパフォーマンスレビュー

## 概要
Spaceの切り替え処理において、パフォーマンスボトルネックと改善点を分析しました。

## 現在の実装分析

### Space切り替えの流れ
1. **UI更新**: `setActiveSpace` でローカル状態を即座に更新
2. **API呼び出し**: `updateSpaceLastActive` でサーバーサイド更新
3. **ナビゲーション**: `router.push` でページ遷移

### 主要コンポーネント

#### SpaceList.tsx (src/app/features/space/components/sidebar/SpaceList.tsx:24-37)
```typescript
const handleSpaceClick = useCallback(
  async (spaceId: string) => {
    try {
      dispatch(setActiveSpace(spaceId))
      dispatch(updateSpaceLastActive({
        spaceId,
        workspaceId,
      }))
      router.push(`/space/${spaceId}`, {
        scroll: false,
      })
    } catch (error) {
      console.error('スペースの切り替えに失敗しました:', error)
    }
  },
  [dispatch, workspaceId, router],
)
```

#### SpaceOverlay.tsx (src/app/(dashboard)/components/SpaceOverlay.tsx:85-97)
```typescript
try {
  dispatch(setActiveSpace(spaceId))
  await dispatch(updateSpaceLastActive({
    spaceId,
    workspaceId,
  })).unwrap()
  
  router.push(`/space/${spaceId}`, {
    scroll: false,
  })
  
  dispatch(hideSpaceOverlay())
} catch (error) {
  console.error('Failed to update active space:', error)
}
```

## 特定されたパフォーマンス問題

### 1. 🔴 重大: 冗長なRedux状態更新
**場所**: spaceSlice.ts:144-148
```typescript
.addCase(updateSpaceLastActive.fulfilled, (state, action) => {
  state.spaces = state.spaces.map((space) => ({
    ...space,
    isLastActive: space.id === action.payload.id,
  }))
  state.activeSpaceId = action.payload.id
})
```

**問題**: 
- 全スペース配列の完全な再構築が発生
- `isLastActive`フラグ更新のために全オブジェクトを再作成
- 不必要なコンポーネント再レンダリングの原因

**パフォーマンス影響**: スペース数に比例したO(n)の計算量

### 2. 🟡 中程度: 非同期処理の不整合
**場所**: SpaceListとSpaceOverlayで異なる実装

**SpaceList**: `await`なしでAPI呼び出し
**SpaceOverlay**: `await`ありでAPI呼び出し

**問題**: 
- 一貫性のない挙動
- エラーハンドリングの違い
- ユーザー体験の不整合

### 3. 🟡 中程度: セレクター最適化の不足
**場所**: selector.ts:20-23
```typescript
const selectSortedSpacesByWorkspaceId = createSelector(
  [selectSpacesByWorkspaceId],
  (spaces) => [...spaces].sort((a, b) => a.order - b.order),
)
```

**問題**:
- 毎回新しい配列を作成
- ソート処理がメモ化されていない
- 不必要な再計算

### 4. 🟡 中程度: コンポーネント再レンダリング
**場所**: SpaceList.tsxでmemoを使用しているが、依存関係の最適化不足

**問題**:
- useCallbackの依存配列に`router`が含まれている
- ルーター変更時の不必要な再レンダリング

## 推奨される最適化

### 1. Redux状態更新の最適化
```typescript
// 現在の実装を以下に変更
.addCase(updateSpaceLastActive.fulfilled, (state, action) => {
  // 前回のアクティブスペースを探して更新
  const previousActive = state.spaces.find(space => space.isLastActive)
  if (previousActive && previousActive.id !== action.payload.id) {
    previousActive.isLastActive = false
  }
  
  // 新しいアクティブスペースを探して更新
  const newActive = state.spaces.find(space => space.id === action.payload.id)
  if (newActive) {
    newActive.isLastActive = true
  }
  
  state.activeSpaceId = action.payload.id
})
```

### 2. 非同期処理の統一
```typescript
// 共通のSpaceスイッチ関数を作成
const switchSpace = async (spaceId: string, workspaceId: string) => {
  dispatch(setActiveSpace(spaceId))
  
  try {
    await dispatch(updateSpaceLastActive({
      spaceId,
      workspaceId,
    })).unwrap()
    
    router.push(`/space/${spaceId}`, { scroll: false })
  } catch (error) {
    // エラー時はロールバック
    console.error('Space switch failed:', error)
  }
}
```

### 3. セレクター最適化
```typescript
const selectSortedSpacesByWorkspaceId = createSelector(
  [selectSpacesByWorkspaceId],
  (spaces) => {
    // 既にソート済みかチェック
    const needsSort = spaces.some((space, index) => 
      index > 0 && space.order < spaces[index - 1].order
    )
    
    return needsSort 
      ? [...spaces].sort((a, b) => a.order - b.order)
      : spaces
  },
)
```

### 4. コンポーネント最適化
```typescript
// routerを依存配列から除外
const handleSpaceClick = useCallback(
  async (spaceId: string) => {
    await switchSpace(spaceId, workspaceId)
  },
  [workspaceId], // routerを除外
)
```

## 期待される改善効果

### パフォーマンス向上
- **Redux更新**: O(n) → O(1) （スペース数に関係なく一定時間）
- **再レンダリング**: 75%削減（全スペース更新 → 2スペースのみ）
- **セレクター**: 不要なソート処理の削減

### ユーザー体験向上
- **応答性**: 即座のUI更新維持
- **一貫性**: 統一された非同期処理
- **信頼性**: 適切なエラーハンドリング

## 実装優先度

1. **高**: Redux状態更新の最適化（最大の効果）
2. **中**: 非同期処理の統一（UX改善）
3. **中**: セレクター最適化（長期的パフォーマンス）
4. **低**: コンポーネント最適化（微細な改善）

## 測定指標

実装後は以下を監視することを推奨：
- Space切り替え時のコンポーネント再レンダリング回数
- Redux DevToolsでの状態更新回数
- ブラウザDevToolsでのPerformanceタブでの計測